
async function searchGenesisId() {
    const batchTxId = 'a486ca3980870265923bc4a6387f73fff895d6b1f02f84616f2a76d54c40fb69';
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const reversedId = 'aa46c40db7c863ebe82e303bd381cdbda42e4a10cc70687a652c632ed19a99b5';

    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${batchTxId}/hex`);
    const hex = await response.text();

    if (hex.includes(deployTxId)) {
        console.log("FOUND Genesis TXID in Batch TX!");
    } else if (hex.includes(reversedId)) {
        console.log("FOUND Reversed Genesis TXID in Batch TX!");
    } else {
        console.log("NOT FOUND. Genesis TXID is absent from Batch TX.");
    }
}
searchGenesisId();
