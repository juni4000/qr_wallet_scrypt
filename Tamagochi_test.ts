
import { Tamagochi_v1, GameState, ActionType, ItemId, ItemMerkleProof, Item } from '../Tamagochi_v1';
import { bsv, WhatsonchainProvider, PubKey, findSig, toByteString, int2ByteString, FixedArray, ByteString, Utils, hash160, toHex, PubKeyHash, Sha256, Scrypt, SignatureResponse, len, slice, hash256 } from 'scrypt-ts';
import { TestWallet } from 'scrypt-ts';
import artifact from './artifacts/Tamagochi_v1.json';
import { items, itemsTree, itemsRoot, serializeItem } from '../build_items_merkle';

const mywif = "Kzi1JSbeEeKNPrEgxqDJiVjfft7votscC5iHDef6gkBcbAk5RyCi";
const provider = new WhatsonchainProvider(bsv.Networks.mainnet);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    try {
        console.log('--- Tamagochi_v1: WORK Debug Test (Skipping Move) ---');

        const privateKey = bsv.PrivateKey.fromWIF(mywif);
        const address = privateKey.toAddress();
        const publicKey = privateKey.toPublicKey();
        const pubKeyHash = PubKeyHash(hash160(toByteString(publicKey.toHex(), false)));
        console.log('Address:', address.toString());

        await Scrypt.init({
            apiKey: '4T2vKkTNg7tfaOVsvmOeEh7E1rMUNk9dbYfjCejmLY6A6R2n',
            network: bsv.Networks.mainnet
        });

        const signer = new TestWallet(privateKey, provider);
        Tamagochi_v1.loadArtifact(artifact);

        const origListUnspent = provider.listUnspent.bind(provider);
        provider.listUnspent = async function (address: any, options?: any) {
            const utxos = await origListUnspent(address, options);
            return utxos.filter((u: any) => u.satoshis > 100);
        } as any;
        (provider as any).getFeePerKb = async () => 100;
        (provider as any).sendRawTransaction = async function (rawTxHex: string) {
            console.log('Broadcasting via ARC... len:', rawTxHex.length);
            const fetch = (await import('node-fetch')).default;
            const res = await fetch('https://arc.taal.com/v1/tx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream', 'Authorization': 'Bearer mainnet_bf0d115a342ef216d0445041cb405a37' },
                body: Buffer.from(rawTxHex, 'hex')
            });
            const text = await res.text();
            console.log('ARC response:', res.status, text);
            if (!res.ok) throw new Error(`ARC broadcast failed: ${text}`);
            return JSON.parse(text).txid;
        };

        // 1. Deploy (Starts at Headhunters/06)
        console.log('\n=== STEP 1: Deploying (At Headhunters) ===');
        const initialRandomSeed = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        const instance = new Tamagochi_v1(pubKeyHash, pubKeyHash, initialRandomSeed, Sha256(itemsRoot));
        await instance.connect(signer);
        const deployTx = await instance.deploy(1);
        console.log('Deployed! TXID:', deployTx.id);

        let latestInstance = Tamagochi_v1.fromTx(deployTx, 0);
        await latestInstance.connect(signer);

        /*
        console.log('\n=== STEP 1.5: Move to Head Hunters ===');
        const rMove1 = await performPacked(latestInstance, BigInt(ItemId.MOVE_ACTION), 6n); // Move to 06
        console.log('Moved to Head Hunters! TXID:', rMove1.tx.id);
        const txMove1Id = await (provider as any).sendRawTransaction(rMove1.tx.toString());
        latestInstance = Tamagochi_v1.fromTx(rMove1.tx, 0);
        await latestInstance.connect(signer);
        */

        // Check Initial State
        let state = latestInstance.unpackState(latestInstance.packedGameState);
        console.log('Initial Location:', state.currentLocation); // Should be 06

        // Helper
        async function performPacked(inst: Tamagochi_v1, actionId: bigint, amount: bigint) {
            console.log(`\n--- Performing Action ${actionId} (Amount: ${amount}) ---`);
            const fixedActions: FixedArray<ByteString, 3> = [toByteString(''), toByteString(''), toByteString('')];
            const fixedItems: FixedArray<Item, 3> = [items[0], items[0], items[0]];
            const fixedProofs: FixedArray<ItemMerkleProof, 3> = [itemsTree.getProof(0), itemsTree.getProof(0), itemsTree.getProof(0)];

            const itemDef = items.find(it => it.id === BigInt(actionId))!;
            if (!itemDef) throw new Error(`Item ${actionId} not found`);

            const itemIndex = items.indexOf(itemDef);
            const packed = int2ByteString(BigInt(itemDef.actionType), 1n) + int2ByteString(amount, 1n);
            fixedActions[0] = packed;
            fixedItems[0] = itemDef;
            fixedProofs[0] = itemsTree.getProof(itemIndex);

            const nextInst = inst.next();
            let simulated = inst.unpackState(inst.packedGameState);
            console.log(`Pre-Sim State: WorkLoc=${simulated.workLocation}, JobCount=${simulated.jobCount}, Money=${simulated.money}`);

            simulated = nextInst.processAction(simulated, BigInt(itemDef.actionType), itemDef, amount);
            nextInst.packedGameState = nextInst.packState(simulated);

            // AUTO-FIX: Simulate genesisTxId update if it's the first action
            if (nextInst.genesisTxId === toByteString('')) {
                // The contract logic updates genesisTxId to the current generic UTXO txid (the one being spent)
                // We must replicate this in nextInst so the output matches.
                if (inst.utxo) {
                    // inst.utxo.txId is usually 'display' format (LE). Contract uses 'internal' format (BE) for outpoints.
                    // We must reverse it.
                    const txId = inst.utxo.txId;
                    const reversedTxId = txId.match(/../g)!.reverse().join('');
                    nextInst.genesisTxId = reversedTxId;
                    console.log(`Updated nextInst.genesisTxId to: ${nextInst.genesisTxId} (reversed from ${txId})`);
                }
            }

            // Log simulated state
            console.log(`Simulated next state:`);
            console.log(`  Loc: ${simulated.currentLocation}, WorkLoc: ${simulated.workLocation},  Money: ${simulated.money}, Hours: ${simulated.hoursLeft}`);

            const { tx } = await inst.methods.performActionPacked(
                (sigResps: SignatureResponse[]) => findSig(sigResps, publicKey),
                PubKey(publicKey.toString()),
                fixedActions,
                fixedItems,
                fixedProofs,
                { pubKeyOrAddrToSign: publicKey, changeAddress: address, transfer: nextInst } as any
            );
            return { tx, nextInst };
        }

        // 2. Find Job
        console.log('\n=== STEP 2: Find Job ===');
        const r1 = await performPacked(latestInstance, BigInt(ItemId.FIND_JOB), 1n);
        console.log('Found Job! TXID:', r1.tx.id);
        const tx1Id = await (provider as any).sendRawTransaction(r1.tx.toString());
        console.log('Confirmed TX:', tx1Id);
        latestInstance = Tamagochi_v1.fromTx(r1.tx, 0);
        await latestInstance.connect(signer);

        // 3. Move to assigned work location?
        // FIND_JOB assigns a random work location. We need to check where it is.
        // If it's different from Headhunters (06), we must move there.
        // Wait, RandomWorkLocation can be any of 9 locations.
        // If not at work location, we must move.

        state = latestInstance.unpackState(latestInstance.packedGameState);
        const workLoc = state.workLocation;
        const currentLoc = state.currentLocation;
        console.log(`Current Loc: ${currentLoc}, Work Loc: ${workLoc}`);

        if (workLoc !== currentLoc) {
            console.log('=== STEP 2.5: Move to Work Location ===');
            // Determine loc ID from workLoc hex?
            // Since we use itemIdToLocation logic, if workLoc is '0a', it's 10. if '00', it's 0.
            // We can pass the byte value as amount to MOVE.
            // byteString2Int(workLoc) -> location ID.
            // Helper to convert:
            const targetLocId = BigInt('0x' + workLoc); // Assuming hex string
            // Actually workLoc is a ByteString (hex string in TS).
            // If workLoc is '00', targetLocId is 0.
            // If workLoc is '0a', targetLocId is 10.
            console.log(`Moving to Work Location ID: ${targetLocId}`);

            const rMove = await performPacked(latestInstance, BigInt(ItemId.MOVE_ACTION), targetLocId);
            console.log('Moved to Work! TXID:', rMove.tx.id);
            const txMoveId = await (provider as any).sendRawTransaction(rMove.tx.toString());
            latestInstance = Tamagochi_v1.fromTx(rMove.tx, 0);
            await latestInstance.connect(signer);
        }

        // 4. WORK
        console.log('\n=== STEP 3: WORK ===');
        const r2 = await performPacked(latestInstance, BigInt(ItemId.WORK), 2n); // Work 2 hours
        console.log('Worked! TXID:', r2.tx.id);
        const tx2Id = await (provider as any).sendRawTransaction(r2.tx.toString());
        console.log('Confirmed Work TX:', tx2Id);

    } catch (e: any) {
        console.error('ERROR:', e.message);
        if (e.message.includes('mismatch')) console.error('HASH OUTPUTS MISMATCH! Local simulation differs from contract execution.');
    }
}

main();
