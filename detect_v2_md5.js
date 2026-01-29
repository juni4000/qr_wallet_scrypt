
async function searchV2Md5() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const v2Md5 = 'e3ffaec64945a93d8652e73106ee6415';

    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();

    console.log(`Searching for V2 MD5 (${v2Md5}) in ${deployTxId}...`);
    console.log(`Found: ${hex.toLowerCase().includes(v2Md5)}`);
}
searchV2Md5();
