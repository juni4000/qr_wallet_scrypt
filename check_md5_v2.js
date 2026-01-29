
const { bsv } = require('scrypt-ts');

async function checkMd5() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);
    const script = tx.outputs[0].script;

    const chunks = script.chunks;
    for (let i = chunks.length - 10; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`[${i}] ${chunk.buf ? chunk.buf.toString('hex') : 'Opcode: ' + chunk.opcodenum}`);
    }
}
checkMd5();
