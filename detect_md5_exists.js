
async function searchMd5s() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const newMd5 = '0f4dc45df0c6a6fb6d8e201e6d4d6acd';
    const oldMd5 = '646b9295d266af093e19be5cb132b97d';

    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text().then(t => t.toLowerCase());

    console.log(`Searching for MD5s in ${deployTxId}...`);
    console.log(`New MD5 (${newMd5}): ${hex.includes(newMd5)}`);
    console.log(`Old MD5 (${oldMd5}): ${hex.includes(oldMd5)}`);
}
searchMd5s();
