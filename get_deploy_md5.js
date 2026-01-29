
const { bsv } = require('scrypt-ts');

async function getDeployMd5() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);
    const script = tx.outputs[0].script;
    const asm = script.toASM();
    const chunks = script.chunks;

    // In scrypt-ts: <Pushes> <Data> <Code> <PushedStateProps> <Length> <Marker>
    // The MD5 is in a chunk near the end, usually fixed size 16 bytes.
    for (let i = chunks.length - 1; i >= 0; i--) {
        const chunk = chunks[i];
        if (chunk.buf && chunk.buf.length === 16) {
            console.log(`Potential MD5 (index ${i}): ${chunk.buf.toString('hex')}`);
            break;
        }
    }
}
getDeployMd5();
