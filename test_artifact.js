
const fs = require('fs');
const filePath = '/Users/mike/projects/wallet2/wallet_scrypt/deploy/Tamagochi_v1.json';

const ADDR = '1FAKiEhReUbVha5Fac94ao47u2kq4mmpnA';

async function analyze() {
    try {
        const artifact = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log("Artifact Name:", artifact.contract);

        // We'd need scrypt-ts and bsv to actually parse, but let's simulate the scan logic
        console.log("Analyzing address:", ADDR);

        const historyResp = await fetch(`https://api.whatsonchain.com/v1/bsv/main/address/${ADDR}/history`);
        const history = await historyResp.json();
        console.log(`Found ${history.length} transactions.`);

        const top5 = history.slice(0, 5);
        console.log("Top 5 transactions:");
        for (const tx of top5) {
            console.log(`- ${tx.tx_hash} (Height: ${tx.height})`);
        }

        // Ideally we'd loop and fetch hex and try GameContract.fromTx
        // Since we are in Node, we can't easily use the browser-bundled scrypt_bundle.js
        // unless we require it.

        // Let's see how much memory/size it takes
        console.log("Artifact size:", (fs.statSync(filePath).size / 1024).toFixed(2), "KB");
    } catch (e) {
        console.error("Error:", e);
    }
}

analyze();
