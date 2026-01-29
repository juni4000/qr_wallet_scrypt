
import { Tamagochi_v1, GameState, ActionType, ItemId, ItemMerkleProof, Item } from '../Tamagochi_v1';
import { bsv, WhatsonchainProvider, PubKey, findSig, toByteString, int2ByteString, FixedArray, ByteString, Utils, hash160, toHex, PubKeyHash, Sha256, Scrypt, SignatureResponse, len, slice, hash256 } from 'scrypt-ts';
import { TestWallet } from 'scrypt-ts';
import artifact from './artifacts/Tamagochi_v1.json';
import { items, itemsTree, itemsRoot, serializeItem } from '../build_items_merkle';

// User's WIF (Mainnet)
const mywif = "Kzi1JSbeEeKNPrEgxqDJiVjfft7votscC5iHDef6gkBcbAk5RyCi";
const provider = new WhatsonchainProvider(bsv.Networks.mainnet);

async function main() {
    try {
        console.log('--- Tamagochi_v1: Debug Deploy + Action Test ---');

        const privateKey = bsv.PrivateKey.fromWIF(mywif);
        const address = privateKey.toAddress();
        const publicKey = privateKey.toPublicKey();
        const pubKeyHash = PubKeyHash(hash160(toByteString(publicKey.toHex(), false)));
        console.log('Address:', address.toString());
        console.log('PubKeyHash:', pubKeyHash);

        // Initialize Scrypt
        await Scrypt.init({
            apiKey: '4T2vKkTNg7tfaOVsvmOeEh7E1rMUNk9dbYfjCejmLY6A6R2n',
            network: bsv.Networks.mainnet
        });

        const signer = new TestWallet(privateKey, provider);

        // Load Artifact
        Tamagochi_v1.loadArtifact(artifact);
        console.log('Artifact loaded. Items root:', itemsRoot);
        console.log('Artifact hex length:', (artifact as any).hex?.length);

        // ============ DEBUG: Verify items and merkle tree ============
        console.log('\n=== DEBUG: Item Verification ===');

        // Find MOVE_ACTION item
        const moveItem = items.find(it => it.id === ItemId.MOVE_ACTION)!;
        const moveIndex = items.indexOf(moveItem);
        console.log('MOVE item index:', moveIndex, 'id:', moveItem.id, 'actionType:', moveItem.actionType);
        console.log('MOVE name hex:', moveItem.name);
        console.log('MOVE possibleLocations hex:', moveItem.possibleLocations, 'len:', len(moveItem.possibleLocations));
        console.log('MOVE valuesToChange hex:', moveItem.valuesToChange, 'len:', len(moveItem.valuesToChange));

        const moveSerialized = serializeItem(moveItem);
        console.log('MOVE serialized hex:', moveSerialized);
        console.log('MOVE serialized len:', len(moveSerialized));
        const moveLeafHash = hash256(moveSerialized);
        console.log('MOVE leaf hash:', moveLeafHash);

        const moveProof = itemsTree.getProof(moveIndex);
        console.log('MOVE proof index:', moveProof.index);
        console.log('MOVE proof siblings:', moveProof.siblings.map((s, i) => `[${i}]: ${s.substring(0, 16)}...`));

        // Verify merkle proof locally
        let h = Sha256(moveLeafHash);
        let pos = moveProof.index;
        for (let i = 0; i < 6; i++) {
            const sibling = moveProof.siblings[i];
            if (pos % 2n === 0n) {
                h = Sha256(hash256(h + sibling));
            } else {
                h = Sha256(hash256(sibling + h));
            }
            pos /= 2n;
        }
        console.log('MOVE computed root:', h);
        console.log('MOVE root matches:', h === itemsRoot);

        // Find FIND_JOB item
        const findJobItem = items.find(it => it.id === ItemId.FIND_JOB)!;
        const findJobIndex = items.indexOf(findJobItem);
        console.log('\nFIND_JOB item index:', findJobIndex, 'id:', findJobItem.id, 'actionType:', findJobItem.actionType);
        console.log('FIND_JOB name hex:', findJobItem.name);
        console.log('FIND_JOB possibleLocations hex:', findJobItem.possibleLocations, 'len:', len(findJobItem.possibleLocations));
        console.log('FIND_JOB valuesToChange hex:', findJobItem.valuesToChange, 'len:', len(findJobItem.valuesToChange));

        const findJobSerialized = serializeItem(findJobItem);
        console.log('FIND_JOB serialized hex:', findJobSerialized);
        console.log('FIND_JOB serialized len:', len(findJobSerialized));

        // ============ DEBUG: Verify action packing ============
        console.log('\n=== DEBUG: Action Byte Packing ===');

        const moveActionPacked = int2ByteString(BigInt(moveItem.actionType), 1n) + int2ByteString(6n, 1n);
        console.log('MOVE action packed:', moveActionPacked, 'len:', len(moveActionPacked));
        console.log('  byte[0] (actionType):', slice(moveActionPacked, 0n, 1n), '= actionType', Utils.fromLEUnsigned(slice(moveActionPacked, 0n, 1n)));
        console.log('  byte[1] (amount):', slice(moveActionPacked, 1n, 2n), '= amount', Utils.fromLEUnsigned(slice(moveActionPacked, 1n, 2n)));

        const findJobActionPacked = int2ByteString(BigInt(findJobItem.actionType), 1n) + int2ByteString(0n, 1n);
        console.log('FIND_JOB action packed:', findJobActionPacked, 'len:', len(findJobActionPacked));
        console.log('  byte[0] (actionType):', slice(findJobActionPacked, 0n, 1n), '= actionType', Utils.fromLEUnsigned(slice(findJobActionPacked, 0n, 1n)));
        console.log('  byte[1] (amount):', slice(findJobActionPacked, 1n, 2n), '= amount', Utils.fromLEUnsigned(slice(findJobActionPacked, 1n, 2n)));

        // ============ STEP 1: Deploy fresh contract ============
        console.log('\n=== STEP 1: Deploying fresh contract ===');
        const initialRandomSeed = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        const instance = new Tamagochi_v1(
            pubKeyHash,
            pubKeyHash, // factory address = same for testing
            initialRandomSeed,
            Sha256(itemsRoot)
        );
        await instance.connect(signer);

        // Override provider to filter confirmed UTXOs and use ARC for broadcast
        const origListUnspent = provider.listUnspent.bind(provider);
        provider.listUnspent = async function (address: any, options?: any) {
            const utxos = await origListUnspent(address, options);
            console.log('All UTXOs:', utxos.length);
            const confirmed = utxos.filter((u: any) => u.satoshis > 100);
            console.log('Filtered UTXOs (>100 sats):', confirmed.length, confirmed.map((u: any) => ({ txId: u.txId?.substring(0, 16), satoshis: u.satoshis })));
            return confirmed;
        } as any;

        // Set fee rate
        (provider as any).getFeePerKb = async () => 100;

        // Override broadcast to use ARC directly
        (provider as any).sendRawTransaction = async function (rawTxHex: string) {
            console.log('Broadcasting via ARC... hex length:', rawTxHex?.length);
            if (rawTxHex) console.log('TX hex first 200:', rawTxHex.substring(0, 200));
            const fetch = (await import('node-fetch')).default;
            const res = await fetch('https://arc.taal.com/v1/tx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': 'Bearer mainnet_bf0d115a342ef216d0445041cb405a37'
                },
                body: Buffer.from(rawTxHex, 'hex')
            });
            const text = await res.text();
            console.log('ARC response:', res.status, text);
            if (!res.ok) {
                throw new Error(`ARC broadcast failed (${res.status}): ${text}`);
            }
            const json = JSON.parse(text);
            return json.txid;
        };

        // Check scripts BEFORE deploy
        console.log('\n=== PRE-DEPLOY Script Check ===');
        console.log('instance.getStateScript() length:', instance.getStateScript().length / 2, 'bytes');
        console.log('instance.lockingScript length:', instance.lockingScript.toHex().length / 2, 'bytes');
        console.log('Scripts match:', instance.getStateScript() === instance.lockingScript.toHex());

        const preDeployState = instance.getStateScript();
        const preDeployLocking = instance.lockingScript.toHex();
        if (preDeployState !== preDeployLocking) {
            console.log('getStateScript last 200:', preDeployState.slice(-200));
            console.log('lockingScript last 200:', preDeployLocking.slice(-200));
        }

        // Deploy with 1 sat since buildStateOutputNFT() hardcodes 1 sat output
        const deployTx = await instance.deploy(1);
        console.log('Deployed! TXID:', deployTx.id);

        // ============ DEBUG: Verify deployed state ============
        console.log('\n=== DEBUG: Deployed State Verification ===');
        const deployedPackedState = instance.packedGameState;
        console.log('packedGameState hex:', deployedPackedState);
        console.log('packedGameState hex length (chars):', deployedPackedState.length, '-> bytes:', deployedPackedState.length / 2);
        console.log('Expected packed state size: 78 bytes (156 hex chars)');

        const deployedState = instance.unpackState(deployedPackedState);
        console.log('Unpacked state:', JSON.stringify(deployedState, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));

        // Verify pack/unpack roundtrip
        const repackedState = instance.packState(deployedState);
        console.log('Repacked state matches:', repackedState === deployedPackedState);
        if (repackedState !== deployedPackedState) {
            console.log('MISMATCH! repacked:', repackedState);
        }

        console.log('isRandomEventDue:', instance.isRandomEventDue);
        console.log('lastRandomSeed:', instance.lastRandomSeed);
        console.log('itemsRoot on instance:', instance.itemsRoot);
        console.log('itemsRoot matches:', instance.itemsRoot === Sha256(itemsRoot));

        // ============ DEBUG: Verify state script ============
        console.log('\n=== DEBUG: State Script Verification ===');
        const stateScript = instance.getStateScript();
        console.log('State script length (hex chars):', stateScript.length);
        console.log('State script first 100:', stateScript.substring(0, 100));

        // ============ STEP 2: Perform actions (Move + Find Job) ============
        console.log('\n=== STEP 2: Performing actions ===');

        const latestInstance = Tamagochi_v1.fromTx(deployTx, 0);
        await latestInstance.connect(signer);

        console.log('Loaded from deploy TX.');

        // CRITICAL CHECK: Compare latestInstance lockingScript with actual deploy TX output script
        const deployOutputScript = deployTx.outputs[0].script.toHex();
        const latestLockingScript = latestInstance.lockingScript.toHex();
        console.log('Deploy TX output 0 script length:', deployOutputScript.length / 2, 'bytes');
        console.log('latestInstance lockingScript length:', latestLockingScript.length / 2, 'bytes');
        console.log('MATCH:', deployOutputScript === latestLockingScript);
        if (deployOutputScript !== latestLockingScript) {
            console.log('!!! CRITICAL: lockingScript MISMATCH !!!');
            console.log('Diff:', deployOutputScript.length / 2 - latestLockingScript.length / 2, 'bytes');
            // Find first difference
            for (let d = 0; d < Math.min(deployOutputScript.length, latestLockingScript.length); d++) {
                if (deployOutputScript[d] !== latestLockingScript[d]) {
                    console.log(`First diff at hex pos ${d} (byte ${d / 2}):`);
                    console.log(`  Deploy output: ...${deployOutputScript.slice(Math.max(0, d - 20), d + 40)}`);
                    console.log(`  latestInstance: ...${latestLockingScript.slice(Math.max(0, d - 20), d + 40)}`);
                    break;
                }
            }
            // Show ends
            console.log('Deploy output last 200:', deployOutputScript.slice(-200));
            console.log('latestInst last 200:', latestLockingScript.slice(-200));
        }

        console.log('latestInstance.packedGameState:', latestInstance.packedGameState);
        console.log('packedGameState length:', latestInstance.packedGameState.length, 'bytes:', latestInstance.packedGameState.length / 2);
        console.log('isRandomEventDue:', latestInstance.isRandomEventDue);
        console.log('lastRandomSeed:', latestInstance.lastRandomSeed);
        console.log('playerPubKeyHash:', latestInstance.playerPubKeyHash);
        console.log('itemsRoot:', latestInstance.itemsRoot);

        // Build action arrays
        const EMPTY_ACTION: ByteString = toByteString('');
        const EMPTY_ITEM: Item = items[0]; // Use first item as filler
        const EMPTY_PROOF: ItemMerkleProof = itemsTree.getProof(0);

        // Try with just ONE action first to narrow down the OP_SPLIT error
        const actionsQueue = [
            { itemId: ItemId.MOVE_ACTION, amount: 6n },   // Move to HEAD_HUNTERS (location 6)
            //{ itemId: ItemId.FIND_JOB, amount: 0n },      // Find Job - disabled for debug
        ];

        const fixedActions: FixedArray<ByteString, 3> = [EMPTY_ACTION, EMPTY_ACTION, EMPTY_ACTION];
        const fixedItems: FixedArray<Item, 3> = [EMPTY_ITEM, EMPTY_ITEM, EMPTY_ITEM];
        const fixedProofs: FixedArray<ItemMerkleProof, 3> = [EMPTY_PROOF, EMPTY_PROOF, EMPTY_PROOF];

        // Prepare next instance
        const nextInstance = latestInstance.next();
        let simulatedState = latestInstance.unpackState(latestInstance.packedGameState);

        console.log('\n=== DEBUG: Action Preparation ===');
        for (let i = 0; i < 3; i++) {
            if (i < actionsQueue.length) {
                const action = actionsQueue[i];
                const itemDef = items.find(it => it.id === action.itemId)!;
                const itemIndex = items.indexOf(itemDef);
                const packed = int2ByteString(BigInt(itemDef.actionType), 1n) + int2ByteString(action.amount, 1n);

                fixedActions[i] = packed;
                fixedItems[i] = itemDef;
                fixedProofs[i] = itemsTree.getProof(itemIndex);

                console.log(`\nAction ${i}:`);
                console.log(`  ItemId: ${action.itemId}, ActionType: ${itemDef.actionType} (${ActionType[itemDef.actionType]}), Amount: ${action.amount}`);
                console.log(`  Item index in array: ${itemIndex}`);
                console.log(`  Packed action bytes: ${packed} (len: ${len(packed)})`);
                console.log(`  Item name: ${itemDef.name}`);
                console.log(`  Item possibleLocations: ${itemDef.possibleLocations} (len: ${len(itemDef.possibleLocations)})`);
                console.log(`  Item valuesToChange: ${itemDef.valuesToChange} (len: ${len(itemDef.valuesToChange)})`);
                console.log(`  Item priceDaySalary: ${itemDef.priceDaySalary}`);

                // Verify item serialization matches contract expectation
                const itemPacked = int2ByteString(BigInt(itemDef.id), 1n) +
                    itemDef.name +
                    int2ByteString(BigInt(itemDef.actionType), 1n) +
                    int2ByteString(itemDef.priceDaySalary, 32n) +
                    int2ByteString(len(itemDef.possibleLocations), 1n) + itemDef.possibleLocations +
                    int2ByteString(len(itemDef.valuesToChange), 2n) + itemDef.valuesToChange;
                console.log(`  Contract-style itemPacked len: ${len(itemPacked)}`);
                console.log(`  Contract-style itemPacked hex: ${itemPacked.substring(0, 80)}...`);

                const leafHash = hash256(itemPacked);
                console.log(`  Leaf hash: ${leafHash}`);

                const proof = fixedProofs[i];
                console.log(`  Proof index: ${proof.index}`);

                // Simulate action
                console.log(`  Pre-action state: money=${simulatedState.money}, happiness=${simulatedState.happiness}, hours=${simulatedState.hoursLeft}, loc=${simulatedState.currentLocation}, workLoc=${simulatedState.workLocation}`);
                simulatedState = nextInstance.processAction(simulatedState, BigInt(itemDef.actionType), itemDef, action.amount);
                console.log(`  Post-action state: money=${simulatedState.money}, happiness=${simulatedState.happiness}, hours=${simulatedState.hoursLeft}, loc=${simulatedState.currentLocation}, workLoc=${simulatedState.workLocation}`);
            } else {
                console.log(`\nAction ${i}: EMPTY (skipped)`);
                console.log(`  fixedActions[${i}] = '' (len: ${len(fixedActions[i])})`);
            }
        }

        nextInstance.packedGameState = nextInstance.packState(simulatedState);
        console.log('\n=== DEBUG: Next Instance State ===');
        console.log('Next packed state:', nextInstance.packedGameState);
        console.log('Next packed state length:', nextInstance.packedGameState.length, 'bytes:', nextInstance.packedGameState.length / 2);

        // Verify the next state also roundtrips
        const nextUnpacked = nextInstance.unpackState(nextInstance.packedGameState);
        const nextRepacked = nextInstance.packState(nextUnpacked);
        console.log('Next state pack/unpack roundtrip matches:', nextRepacked === nextInstance.packedGameState);

        // ============ DEBUG: Verify next instance state script ============
        console.log('\n=== DEBUG: Next Instance State Script ===');
        const nextStateScript = nextInstance.getStateScript();
        console.log('Next state script length (hex chars):', nextStateScript.length);
        console.log('Next state script first 100:', nextStateScript.substring(0, 100));

        // Compare state script structure
        const currentStateScript = latestInstance.getStateScript();
        console.log('Current state script length:', currentStateScript.length);
        console.log('Scripts same length:', currentStateScript.length === nextStateScript.length);
        if (currentStateScript.length !== nextStateScript.length) {
            console.log('WARNING: State scripts have different lengths!');
            console.log('Difference:', nextStateScript.length - currentStateScript.length, 'hex chars');
        }

        // ============ DEBUG: Verify buildStateOutputNFT ============
        console.log('\n=== DEBUG: buildStateOutputNFT ===');
        try {
            const nftOutput = nextInstance.buildStateOutputNFT();
            console.log('buildStateOutputNFT output length:', nftOutput.length);
            console.log('buildStateOutputNFT first 100:', nftOutput.substring(0, 100));
        } catch (e: any) {
            console.error('buildStateOutputNFT FAILED:', e.message);
        }

        try {
            const changeOutput = nextInstance.buildChangeOutput();
            console.log('buildChangeOutput length:', changeOutput.length);
        } catch (e: any) {
            console.error('buildChangeOutput FAILED:', e.message);
        }

        // ============ DEBUG: Try local script verification ============
        console.log('\n=== DEBUG: Local Script Execution Test ===');

        // Try to verify the contract method locally using scrypt-ts verify
        try {
            const testInstance = Tamagochi_v1.fromTx(deployTx, 0);
            // Check if scryptlib can do local verification
            console.log('Contract codePart length:', (testInstance as any).lockingScript?.toHex()?.length);
            console.log('Contract dataPart hex (last 500):', (testInstance as any).getStateScript?.()?.slice(-500));
        } catch (e: any) {
            console.error('Local verification setup error:', e.message);
        }

        // Add logging to capture the preimage
        console.log('\n=== DEBUG: Pre-broadcast Analysis ===');
        console.log('latestInstance UTXO satoshis:', (latestInstance as any).utxo?.satoshis || (latestInstance as any)._utxo?.satoshis || 'unknown');
        console.log('latestInstance from:', (latestInstance as any).from?.outputIndex, (latestInstance as any).from?.tx?.id?.substring(0, 16));

        // Check the contract balance
        console.log('Contract UTXO:', JSON.stringify(latestInstance.utxo, (k, v) => typeof v === 'bigint' ? v.toString() : v));

        // ============ Broadcast ============
        console.log('\n=== Broadcasting transaction ===');

        // Intercept the raw TX to analyze it before broadcast
        const origSend = (provider as any).sendRawTransaction;
        let capturedTxHex = '';
        (provider as any).sendRawTransaction = async function (rawTxHex: string) {
            capturedTxHex = rawTxHex;
            console.log('\n=== DEBUG: Captured TX Analysis ===');
            console.log('TX hex length:', rawTxHex.length);

            // Parse the TX
            const txObj = new bsv.Transaction(rawTxHex);
            console.log('Inputs:', txObj.inputs.length);
            console.log('Outputs:', txObj.outputs.length);

            for (let i = 0; i < txObj.inputs.length; i++) {
                const inp = txObj.inputs[i];
                const scriptHex = inp.script.toHex();
                console.log(`Input ${i}: script len=${scriptHex.length / 2} bytes, prevTxId=${inp.prevTxId?.toString('hex')?.substring(0, 16)}..., outputIndex=${inp.outputIndex}`);
            }

            for (let i = 0; i < txObj.outputs.length; i++) {
                const out = txObj.outputs[i];
                const scriptHex = out.script.toHex();
                console.log(`Output ${i}: script len=${scriptHex.length / 2} bytes, satoshis=${out.satoshis}`);
                if (scriptHex.length < 200) {
                    console.log(`  Script: ${scriptHex}`);
                } else {
                    console.log(`  Script first 100: ${scriptHex.substring(0, 100)}`);
                    console.log(`  Script last 200: ${scriptHex.slice(-200)}`);
                }
            }

            // Check if output 0 (contract continuation) matches expected
            const output0Script = txObj.outputs[0]?.script.toHex();
            const expectedNextScript = nextInstance.getStateScript();
            console.log('\nOutput 0 script matches nextInstance stateScript:', output0Script === expectedNextScript);

            // Compute hashOutputs manually
            let serializedOutputs = '';
            for (let oi = 0; oi < txObj.outputs.length; oi++) {
                const o = txObj.outputs[oi];
                // satoshis as 8-byte LE
                const satBuf = Buffer.alloc(8);
                satBuf.writeBigUInt64LE(BigInt(o.satoshis));
                const scriptHex = o.script.toHex();
                const scriptBuf = Buffer.from(scriptHex, 'hex');
                // varint for script length
                let scriptLenHex: string;
                if (scriptBuf.length < 0xfd) {
                    scriptLenHex = scriptBuf.length.toString(16).padStart(2, '0');
                } else if (scriptBuf.length <= 0xffff) {
                    scriptLenHex = 'fd' + Buffer.from([scriptBuf.length & 0xff, (scriptBuf.length >> 8) & 0xff]).toString('hex');
                } else {
                    scriptLenHex = 'fe' + Buffer.from(new Uint32Array([scriptBuf.length]).buffer).toString('hex');
                }
                serializedOutputs += satBuf.toString('hex') + scriptLenHex + scriptHex;
            }
            console.log('Serialized outputs length:', serializedOutputs.length / 2, 'bytes');
            console.log('Serialized outputs first 100:', serializedOutputs.substring(0, 100));

            const { hash256: h256 } = require('scrypt-ts');
            const hashOutputs = h256(serializedOutputs);
            console.log('Computed hashOutputs:', hashOutputs);

            // Now compute what the contract would compute
            // buildStateOutputNFT() = Utils.buildOutput(removeInsciption(getStateScript()), 1n)
            // For fresh deploy (no inscription), removeInsciption returns script as-is
            const contractOutput0 = Utils.buildOutput(toByteString(expectedNextScript, false), 1n);
            console.log('Contract output 0 (buildStateOutputNFT) length:', contractOutput0.length / 2, 'bytes');

            // buildChangeOutput() = Utils.buildOutput(P2PKH_script, changeAmount) if changeAmount > 0
            const changeScript = Utils.buildPublicKeyHashScript(hash160(toByteString(publicKey.toHex(), false)));
            const changeAmt = BigInt(txObj.outputs[1]?.satoshis || 0);
            const contractOutput1 = changeAmt > 0n ? Utils.buildOutput(changeScript, changeAmt) : toByteString('');
            console.log('Contract output 1 (buildChangeOutput) length:', contractOutput1.length / 2, 'bytes');
            console.log('Change amount:', changeAmt);

            const contractHashOutputs = h256(contractOutput0 + contractOutput1);
            console.log('Contract hashOutputs:', contractHashOutputs);
            console.log('Match:', hashOutputs === contractHashOutputs);

            // Also check: what if changeAmount=0 (no change output)?
            const contractHashOutputsNoChange = h256(contractOutput0);
            console.log('Contract hashOutputs (no change):', contractHashOutputsNoChange);
            console.log('Match (no change):', hashOutputs === contractHashOutputsNoChange);

            // What if the contract uses PubKeyHash directly instead of computing it?
            // The changeAddress is auto-filled from the TX's change address
            // Let's check what address the TX uses for change
            if (txObj.outputs.length > 1) {
                const changeOut = txObj.outputs[txObj.outputs.length - 1];
                console.log('Change output script:', changeOut.script.toHex());
                console.log('Expected PKH script:', Utils.buildPublicKeyHashScript(PubKeyHash(hash160(toByteString(publicKey.toHex(), false)))));
            }

            // Analyze unlocking script to find the preimage
            if (txObj.inputs.length >= 1 && txObj.inputs[0].script.toHex().length > 500) {
                const unlockingHex = txObj.inputs[0].script.toHex();
                console.log('\n=== UNLOCKING SCRIPT ANALYSIS ===');
                console.log('Unlocking script length:', unlockingHex.length / 2, 'bytes');

                // The unlocking script pushes: sig, pubkey, actions[3], items[3], proofs[3], preimage, changeAmount, changeAddress
                // Parse pushdata items from unlocking script
                const chunks = txObj.inputs[0].script.chunks;
                console.log('Unlocking script chunks:', chunks.length);
                for (let ci = 0; ci < chunks.length; ci++) {
                    const chunk = chunks[ci];
                    const buf = chunk.buf;
                    if (buf) {
                        console.log(`  Chunk ${ci}: ${buf.length} bytes, first 20: ${buf.toString('hex').substring(0, 40)}`);
                    } else {
                        console.log(`  Chunk ${ci}: opcode ${chunk.opcodenum}`);
                    }
                }

                // The last 4 chunks are: preimage, changeAmount, changeAddress, methodIndex
                // preimage is chunk[length-4]
                const preimageChunk = chunks[chunks.length - 4];
                if (preimageChunk?.buf) {
                    const preimage = preimageChunk.buf;
                    console.log('\nPreimage length:', preimage.length, 'bytes');
                    // Sighash preimage format:
                    // nVersion (4) + hashPrevouts (32) + hashSequence (32) + outpoint (36) +
                    // scriptCode (varint + data) + value (8) + nSequence (4) + hashOutputs (32) +
                    // nLockTime (4) + sighashType (4)
                    let pp = 0;
                    const nVersion = preimage.slice(pp, pp + 4); pp += 4;
                    const hashPrevouts = preimage.slice(pp, pp + 32); pp += 32;
                    const hashSequence = preimage.slice(pp, pp + 32); pp += 32;
                    const outpoint = preimage.slice(pp, pp + 36); pp += 36;
                    // scriptCode is varint-prefixed
                    const scriptCodeFirstByte = preimage[pp]; pp += 1;
                    let scriptCodeLen = scriptCodeFirstByte;
                    if (scriptCodeFirstByte === 0xfd) {
                        scriptCodeLen = preimage.readUInt16LE(pp); pp += 2;
                    } else if (scriptCodeFirstByte === 0xfe) {
                        scriptCodeLen = preimage.readUInt32LE(pp); pp += 4;
                    }
                    console.log('scriptCode length in preimage:', scriptCodeLen);
                    const scriptCode = preimage.slice(pp, pp + scriptCodeLen); pp += scriptCodeLen;
                    const value = preimage.slice(pp, pp + 8); pp += 8;
                    const nSequence = preimage.slice(pp, pp + 4); pp += 4;
                    const hashOutputs = preimage.slice(pp, pp + 32); pp += 32;
                    const nLockTime = preimage.slice(pp, pp + 4); pp += 4;
                    const sighashType = preimage.slice(pp, pp + 4); pp += 4;

                    console.log('nVersion:', nVersion.toString('hex'));
                    console.log('hashPrevouts:', hashPrevouts.toString('hex'));
                    console.log('hashSequence:', hashSequence.toString('hex'));
                    console.log('outpoint:', outpoint.toString('hex'));
                    console.log('scriptCode length:', scriptCodeLen, '(' + (scriptCodeLen * 2) + ' hex chars)');
                    console.log('scriptCode first 40:', scriptCode.toString('hex').substring(0, 80));
                    console.log('scriptCode last 40:', scriptCode.toString('hex').slice(-80));
                    console.log('value (satoshis):', value.readBigUInt64LE().toString());
                    console.log('nSequence:', nSequence.toString('hex'));
                    console.log('hashOutputs in preimage:', hashOutputs.toString('hex'));
                    console.log('nLockTime:', nLockTime.toString('hex'));
                    console.log('sighashType:', sighashType.toString('hex'));
                    console.log('Total preimage consumed:', pp, 'of', preimage.length);

                    // Compare hashOutputs
                    console.log('\nhashOutputs from preimage:', hashOutputs.toString('hex'));
                    console.log('hashOutputs computed from TX:', hashOutputs.toString('hex'));

                    // Compare scriptCode with the actual locking script
                    const actualLockingScript = currentStateScript; // from latestInstance
                    console.log('Actual locking script length:', actualLockingScript.length / 2, 'bytes');
                    console.log('scriptCode length from preimage:', scriptCodeLen, 'bytes');
                    console.log('Lengths match:', actualLockingScript.length / 2 === scriptCodeLen);

                    if (actualLockingScript.length / 2 !== scriptCodeLen) {
                        console.log('MISMATCH! Diff:', scriptCodeLen - actualLockingScript.length / 2, 'bytes');
                    }

                    // Compare scriptCode content
                    const scriptCodeHex = scriptCode.toString('hex');
                    if (scriptCodeHex !== actualLockingScript) {
                        let firstDiffSC = -1;
                        for (let j = 0; j < Math.min(scriptCodeHex.length, actualLockingScript.length); j++) {
                            if (scriptCodeHex[j] !== actualLockingScript[j]) {
                                firstDiffSC = j;
                                break;
                            }
                        }
                        console.log('scriptCode first diff at hex pos:', firstDiffSC, '(byte', firstDiffSC / 2, ')');
                        if (firstDiffSC >= 0) {
                            console.log('  preimage scriptCode:', scriptCodeHex.slice(firstDiffSC, firstDiffSC + 40));
                            console.log('  actual locking script:', actualLockingScript.slice(firstDiffSC, firstDiffSC + 40));
                        }
                    } else {
                        console.log('scriptCode matches locking script EXACTLY');
                    }
                }
            }

            if (txObj.inputs.length >= 1 && txObj.inputs[0].script.toHex().length > 500) {
                console.log('\n=== LOCAL SCRIPT VERIFICATION ===');
                try {
                    const Interpreter = bsv.Script.Interpreter;
                    // CRITICAL: Use lockingScript (original TX bytes) NOT getStateScript()
                    // getStateScript() re-serializes with isGenesis=false, but the real UTXO has isGenesis=true
                    const actualLockingHex = latestInstance.lockingScript.toHex();
                    console.log('Using lockingScript.toHex() for local verify, length:', actualLockingHex.length / 2);
                    console.log('lockingScript vs getStateScript match:', actualLockingHex === latestInstance.getStateScript());
                    const lockingScript = new bsv.Script(actualLockingHex);
                    const unlockingScript = txObj.inputs[0].script;

                    console.log('Locking script opcodes (first 20):', lockingScript.toString().substring(0, 200));
                    console.log('Unlocking script len:', unlockingScript.toHex().length / 2, 'bytes');

                    const flags = Interpreter.SCRIPT_VERIFY_MINIMALDATA |
                        Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID |
                        Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES |
                        Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES;

                    const interp = new Interpreter();
                    const satoshisBN = new bsv.crypto.BN(1); // 1 satoshi for contract UTXO

                    // Step-by-step execution to find where OP_SPLIT fails
                    // Use dynamic access to avoid TS errors
                    const interp2: any = new Interpreter();
                    let totalSteps = 0;
                    let splitCount = 0;
                    let lastOpcode = '';

                    const origStep = interp2.step.bind(interp2);
                    interp2.step = function (this: any) {
                        totalSteps++;
                        const pc = this.pc;
                        const script = this.script;
                        if (script && pc < script.chunks.length) {
                            const chunk = script.chunks[pc];
                            const opcode = chunk.opcodenum;
                            // OP_SPLIT = 0x7f (127)
                            if (opcode === 0x7f) {
                                splitCount++;
                                // Log stack top 2 values for every OP_SPLIT to catch the failing one
                                const sLen = this.stack?.length || 0;
                                if (sLen >= 2) {
                                    const splitData = this.stack[sLen - 2];
                                    const splitPos = this.stack[sLen - 1];
                                    const dataLen = Buffer.isBuffer(splitData) ? splitData.length : -1;
                                    let posVal = -1;
                                    if (Buffer.isBuffer(splitPos)) {
                                        if (splitPos.length === 0) posVal = 0;
                                        else if (splitPos.length <= 4) {
                                            posVal = 0;
                                            for (let bi = splitPos.length - 1; bi >= 0; bi--) {
                                                posVal = (posVal << 8) | splitPos[bi];
                                            }
                                            // Check sign bit
                                            if (splitPos[splitPos.length - 1] & 0x80) {
                                                posVal = -(posVal ^ (0x80 << ((splitPos.length - 1) * 8)));
                                            }
                                        }
                                    }
                                    if (posVal < 0 || posVal > dataLen) {
                                        console.log(`!!! OP_SPLIT #${splitCount} WILL FAIL: step=${totalSteps} dataLen=${dataLen} splitPos=${posVal}`);
                                        console.log(`  splitData first 40: ${Buffer.isBuffer(splitData) ? splitData.toString('hex').substring(0, 80) : 'N/A'}`);
                                        console.log(`  splitPos hex: ${Buffer.isBuffer(splitPos) ? splitPos.toString('hex') : 'N/A'}`);
                                    }
                                }
                            }
                            // Only log the last 20 OP_VERIFY calls before failure
                            if (opcode === 0x69 || opcode === 0x88 || opcode === 0xac) {
                                const stackLen = this.stack?.length || 0;
                                const topBuf = this.stack?.[stackLen - 1];
                                const topHex = Buffer.isBuffer(topBuf) ? topBuf.toString('hex') : (topBuf != null ? String(topBuf) : 'null');
                                const opName = opcode === 0x69 ? 'OP_VERIFY' : opcode === 0x88 ? 'OP_EQUALVERIFY' : 'OP_CHECKSIG';
                                // Store in ring buffer
                                if (!((this as any)._verifyLog)) (this as any)._verifyLog = [];
                                (this as any)._verifyLog.push(`${opName} step=${totalSteps} stack[${stackLen}] top='${topHex?.substring(0, 40)}' splits=${splitCount}`);
                                if ((this as any)._verifyLog.length > 30) (this as any)._verifyLog.shift();
                            }
                            lastOpcode = `opcode=${opcode} (0x${opcode.toString(16)})`;
                        }
                        const result = origStep.call(this);
                        if (!result) {
                            console.log(`FAILED at step ${totalSteps}: ${lastOpcode}`);
                            console.log('Error:', this.errstr);
                            if (this.stack) {
                                console.log('Stack depth:', this.stack.length);
                                const top10 = this.stack.slice(-10).map((s: any, idx: number) => {
                                    if (Buffer.isBuffer(s)) return `[${idx}] ${s.toString('hex').substring(0, 80)}(${s.length}b)`;
                                    return `[${idx}] ${String(s)}`;
                                });
                                console.log('Stack top 10:', top10);
                            }
                            // Print the verify log
                            if ((this as any)._verifyLog) {
                                console.log('\nLast 30 verify/equalverify/checksig ops:');
                                (this as any)._verifyLog.forEach((l: string) => console.log('  ', l));
                            }
                        }
                        return result;
                    };

                    // Before verify, also compare the two large stack items after execution
                    // The contract code part should be identical between current and next
                    const currentScript = latestInstance.getStateScript();
                    const nextScript = nextInstance.getStateScript();
                    console.log('Current script total hex chars:', currentScript.length, '= bytes:', currentScript.length / 2);
                    console.log('Next script total hex chars:', nextScript.length, '= bytes:', nextScript.length / 2);

                    // Extract code part (everything except the data part at the end)
                    // The data part contains: packedGameState + other props
                    // Let's find where they differ
                    let firstDiff = -1;
                    for (let j = 0; j < Math.min(currentScript.length, nextScript.length); j++) {
                        if (currentScript[j] !== nextScript[j]) {
                            firstDiff = j;
                            break;
                        }
                    }
                    if (firstDiff >= 0) {
                        console.log(`Scripts first differ at hex pos ${firstDiff} (byte ${firstDiff / 2})`);
                        console.log(`  Current[${firstDiff}..+40]: ${currentScript.slice(firstDiff, firstDiff + 40)}`);
                        console.log(`  Next[${firstDiff}..+40]: ${nextScript.slice(firstDiff, firstDiff + 40)}`);
                        console.log(`  This is ${firstDiff / 2} bytes from start, ${(currentScript.length - firstDiff) / 2} bytes from end`);
                    } else {
                        console.log('Scripts are IDENTICAL (no diff found)');
                    }

                    const result = interp2.verify(
                        unlockingScript,
                        lockingScript,
                        txObj,
                        0,
                        flags,
                        satoshisBN
                    );

                    console.log(`\nVerification: ${result}, total steps: ${totalSteps}, OP_SPLIT count: ${splitCount}`);
                    if (!result) {
                        console.log('Final error:', interp2.errstr);
                    }
                } catch (ve: any) {
                    console.error('Local verification error:', ve.message);
                }
            }

            // Now actually broadcast
            return origSend(rawTxHex);
        };

        const { tx } = await latestInstance.methods.performActionPacked(
            (sigResps: SignatureResponse[]) => findSig(sigResps, publicKey),
            PubKey(publicKey.toString()),
            fixedActions,
            fixedItems,
            fixedProofs,
            {
                pubKeyOrAddrToSign: publicKey,
                changeAddress: address,
                transfer: nextInstance
            } as any
        );

        console.log('SUCCESS! Action TXID:', tx.id);

    } catch (e: any) {
        console.error('\n!!! ERROR !!!');
        console.error('Message:', e.message);
        if (e.context) {
            console.error('Context:', JSON.stringify(e.context, null, 2));
        }
        // Check if it's a verification error with details
        if (e.message?.includes('OP_SPLIT') || e.message?.includes('461')) {
            console.error('\nOP_SPLIT debug: This error means a slice() call has out-of-bounds indices.');
            console.error('Possible causes:');
            console.error('1. packedGameState is wrong length (expected 78 bytes / 156 hex chars)');
            console.error('2. Action bytes wrong length (expected 2 bytes each)');
            console.error('3. State script mismatch between current and next instance');
            console.error('4. removeInsciption() in buildStateOutputNFT encounters unexpected script format');
        }
        console.error('Full Error:', e);
    }
}

main();
