
const { bsv } = require('scrypt-ts');

async function checkOldest() {
    const txid = '0211b254b739007d2172df3b4f68dba68adbafb6c4556553ad1b4a777e49429f';
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`);
    const hex = await response.text();
    const tx = new bsv.Transaction(hex);

    console.log(`TX ${txid} inputs:`);
    tx.inputs.forEach((input, i) => {
        console.log(`Input ${i} outpoint: ${input.prevTxId.toString('hex')}:${input.outputIndex}`);
    });
}
checkOldest();
