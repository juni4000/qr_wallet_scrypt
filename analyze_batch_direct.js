
const { Scrypt, bsv, toHex } = require('scrypt-ts');
const fs = require('fs');

async function analyze() {
    const batchTxId = 'a486ca3980870265923bc4a6387f73fff895d6b1f02f84616f2a76d54c40fb69';
    const artifactPath = './Tamagochi_v1.json';
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${batchTxId}/hex`);
    if (!response.ok) throw new Error("Failed to fetch TX");
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);

    console.log(`\n--- Transaction Analysis ---`);
    console.log(`TXID: ${batchTxId}`);

    // Since we don't have the class here, we'll manually check the state in output 0
    const script = tx.outputs[0].script;
    const asm = script.toASM();

    // In scrypt-ts, the state is typically the last part of the script.
    // For Tamagochi_v1, genesisTxId is the 8th state prop.
    // stateProps in artifact: [isOneSatNFT, packedGameState, playerPubKeyHash, contractPrice, lastRandomEventTimestamp, lastRandomSeed, isRandomEventDue, genesisTxId]

    // Let's print the last few pushes in the ASM
    const parts = asm.split(' ');
    console.log("Last 5 pushes in script:");
    console.log(parts.slice(-5).join('\n'));
}

analyze().catch(error => {
    console.error("Error:", error.message);
});
