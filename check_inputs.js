
const { bsv } = require('scrypt-ts');

async function checkInputs() {
    const batchTxId = 'a486ca3980870265923bc4a6387f73fff895d6b1f02f84616f2a76d54c40fb69';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${batchTxId}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);

    console.log(`Batch TX ${batchTxId} inputs:`);
    tx.inputs.forEach((input, i) => {
        console.log(`Input ${i} outpoint: ${input.prevTxId.toString('hex')}:${input.outputIndex}`);
    });
}
checkInputs();
