
const { bsv } = require('scrypt-ts');

async function checkIsGenesis() {
    const txid = 'faa1a1d7d8700e70f4d211fa0fdd4f9660258b9ec53a7e266bd5ace423f126d7';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);

    console.log(`TX ${txid} details:`);
    console.log(`Inputs: ${tx.inputs.length}`);
    tx.inputs.forEach((input, i) => {
        console.log(`Input ${i} script: ${input.script.toHex().substring(0, 50)}...`);
    });
}
checkIsGenesis();
