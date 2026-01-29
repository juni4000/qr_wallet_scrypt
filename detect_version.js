
const { bsv } = require('scrypt-ts');

async function getDeployedMd5() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);
    const script = tx.outputs[0].script;

    // In scrypt-ts, the MD5 is usually at the very end of the locking script followed by the total length and 00 marker.
    // Let's print the last 20 chunks accurately.
    const chunks = script.chunks;
    console.log(`\nLast 20 chunks of ${deployTxId}:`);
    for (let i = chunks.length - 20; i < chunks.length; i++) {
        if (i < 0) continue;
        const c = chunks[i];
        console.log(`[${i}] ${c.buf ? c.buf.toString('hex') : 'OP_' + c.opcodenum}`);
    }
}
getDeployedMd5();
