
const { bsv } = require('scrypt-ts');

async function checkPrevious() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);

    console.log(`TX ${deployTxId} inputs:`);
    tx.inputs.forEach((input, i) => {
        console.log(`Input ${i} outpoint: ${input.prevTxId.toString('hex')}:${input.outputIndex}`);
    });
}
checkPrevious();
