
async function searchMd5() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const targetMd5 = '0f4dc45df0c6a6fb6d8e201e6d4d6acd';

    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();

    if (hex.includes(targetMd5)) {
        console.log("MATCH FOUND! The deployed contract IS the new version.");
    } else {
        console.log("NO MATCH. The deployed contract is an OLD version.");
    }
}
searchMd5();
