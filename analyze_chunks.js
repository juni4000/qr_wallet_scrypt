
const { bsv } = require('scrypt-ts');
const fs = require('fs');

async function analyze() {
    const txid = 'a486ca3980870265923bc4a6387f73fff895d6b1f02f84616f2a76d54c40fb69';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);
    const script = tx.outputs[0].script;

    // In scrypt-ts, state is pushed as OPs at the end.
    // The sequence is: <Code> <StateValue1> <StateValue2> ... <StateValueN> <StateSize> <Marker>
    const chunks = script.chunks;
    console.log(`Total chunks: ${chunks.length}`);

    // Print the last 15 chunks
    for (let i = chunks.length - 15; i < chunks.length; i++) {
        if (i < 0) continue;
        const chunk = chunks[i];
        if (chunk.buf) {
            console.log(`[${i}] Data: ${chunk.buf.toString('hex')}`);
        } else {
            console.log(`[${i}] Opcode: ${chunk.opcodenum}`);
        }
    }
}
analyze();
