
const { bsv } = require('scrypt-ts');

async function checkMd5() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);
    const script = tx.outputs[0].script;

    // The MD5 is the second to last chunk (before total length) or something like that.
    const chunks = script.chunks;
    const md5Chunk = chunks[chunks.length - 2];
    console.log(`MD5 in script: ${md5Chunk.buf.toString('hex')}`);
}
checkMd5();
