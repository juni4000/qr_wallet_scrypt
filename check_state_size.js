
const { bsv } = require('scrypt-ts');

async function checkStateSize() {
    const batchTxId = 'a486ca3980870265923bc4a6387f73fff895d6b1f02f84616f2a76d54c40fb69';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${batchTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);
    const outputScript = tx.outputs[0].script;
    const chunks = outputScript.chunks;

    console.log(`Analyzing chunks near the end...`);
    for (let i = chunks.length - 20; i < chunks.length; i++) {
        const c = chunks[i];
        if (c.buf) {
            console.log(`[${i}] Buffer length: ${c.buf.length}, hex: ${c.buf.toString('hex').substring(0, 10)}...`);
        } else {
            console.log(`[${i}] OP_${c.opcodenum}`);
        }
    }
}
checkStateSize();
