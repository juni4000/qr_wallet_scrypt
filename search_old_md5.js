
async function searchOldMd5() {
    const deployTxId = 'b5999ad12e632c657a6870cc104a2ea4bdcd81d33b302e8eeb63c8b70d0c46aa';
    const oldMd5 = '646b9295d266af093e19be5cb132b97d';

    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${deployTxId}/hex`);
    const hex = await response.text();

    if (hex.includes(oldMd5)) {
        console.log("MATCH! The deployed contract matches the artifact in artifact.js (OLD).");
    } else {
        console.log("NO MATCH for artifact.js MD5 either.");
    }
}
searchOldMd5();
