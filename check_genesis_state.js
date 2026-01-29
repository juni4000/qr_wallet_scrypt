
const { bsv } = require('scrypt-ts');

async function checkGenesisState() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);
    const outputScript = tx.outputs[0].script;
    const chunks = outputScript.chunks;

    console.log(`Genesis TX ${deployTxId} chunks near the end:`);
    for (let i = chunks.length - 20; i < chunks.length; i++) {
        const c = chunks[i];
        if (c.buf) {
            console.log(`[${i}] Buffer length: ${c.buf.length}, hex: ${c.buf.toString('hex')}`);
        } else {
            console.log(`[${i}] OP_${c.opcodenum}`);
        }
    }
}
checkGenesisState();
