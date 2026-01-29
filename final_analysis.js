
const { bsv } = require('scrypt-ts');
const fs = require('fs');

async function analyze() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const batchTxId = 'a486ca3980870265923bc4a6387f73fff895d6b1f02f84616f2a76d54c40fb69';

    console.log("Fetching Batch TX...");
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${batchTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);

    const outputScript = tx.outputs[0].script;
    const outputHex = outputScript.toHex();

    console.log(`\nChecking for Genesis TXID in Batch TX Output 0:`);
    console.log(`Target ID: ${deployTxId}`);

    // Convert to Little Endian if the contract stores it that way
    const leId = Buffer.from(deployTxId, 'hex').reverse().toString('hex');
    console.log(`Target ID (LE): ${leId}`);

    if (outputHex.includes(deployTxId)) {
        console.log("RESULT: SUCCESS! Found BE matches.");
    } else if (outputHex.includes(leId)) {
        console.log("RESULT: SUCCESS! Found LE matches.");
    } else {
        console.log("RESULT: FAILED. Genesis TXID not found in state.");
        // Let's print the tail of the script to see what IS there
        const chunks = outputScript.chunks;
        console.log("\nLast few data chunks (potential state):");
        for (let i = chunks.length - 15; i < chunks.length; i++) {
            const c = chunks[i];
            if (c.buf) console.log(`[${i}] ${c.buf.toString('hex')}`);
            else console.log(`[${i}] OP_${c.opcodenum}`);
        }
    }
}
analyze();
