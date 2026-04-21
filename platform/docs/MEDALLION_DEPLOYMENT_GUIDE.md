# LianaBanyan Medallion Smart Contract Deployment Guide

## Overview
This guide walks you through deploying the custom LianaBanyan Medallion ERC-1155 contract to Base network.

## Contract Features
- ✅ 4 Medallion tiers with max supply limits
- ✅ Batch minting for gas efficiency
- ✅ Owner-only minting controls
- ✅ Metadata URI support for each tier
- ✅ Supply tracking and verification
- ✅ OpenZeppelin security standards

## Prerequisites
1. ✅ WalletConnect Project ID configured (Already done!)
2. [ ] MetaMask or compatible Web3 wallet
3. [ ] Base ETH for gas fees (~0.001 ETH = $2-5)

---

## Deployment Method 1: Remix IDE (Easiest)

### Step 1: Get Base Sepolia Testnet ETH (Free)
1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request test ETH (free, instant)

### Step 2: Open Remix IDE
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Click "File Explorer" → "Create New File"
3. Name it: `LianaBanyanMedallion.sol`
4. Copy the entire contract from `docs/MEDALLION_CONTRACT.sol` and paste it

### Step 3: Compile the Contract
1. Click "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.20+`
3. Click "Compile LianaBanyanMedallion.sol"
4. Ensure no errors (warnings are OK)

### Step 4: Deploy
1. Click "Deploy & Run Transactions" tab
2. Environment: Select "Injected Provider - MetaMask"
3. Connect your MetaMask wallet
4. Switch network to **Base Sepolia** in MetaMask
5. Fill in constructor parameters:
   - `baseURI`: `https://yourdomain.com/metadata/` (your metadata server)
   - `_projectName`: `"HexIsle"` (or your project name)
   - `_projectSKU`: `"HEXISLE-001"` (your project SKU)
   - `initialOwner`: `<Your Wallet Address>`
6. Click "Deploy"
7. Confirm transaction in MetaMask
8. **SAVE THE CONTRACT ADDRESS!** (looks like `0x1234...5678`)

---

## Deployment Method 2: Hardhat (Advanced)

### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

### Hardhat Config
```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY], // Your wallet private key
      chainId: 84532
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8453
    }
  }
};
```

### Deploy Script
```javascript
// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const LianaBanyanMedallion = await ethers.getContractFactory("LianaBanyanMedallion");
  const medallion = await LianaBanyanMedallion.deploy(
    "https://yourdomain.com/metadata/",
    "HexIsle",
    "HEXISLE-001",
    deployer.address
  );

  await medallion.waitForDeployment();
  console.log("Contract deployed to:", await medallion.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Deploy Command
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

---

## After Deployment

### 1. Verify Your Contract (Optional but Recommended)
Go to [BaseScan](https://basescan.org) → "Verify Contract" and submit:
- Contract address
- Compiler version: 0.8.20
- Constructor arguments (encoded)

### 2. Share Contract Address
Once deployed, provide Jarvis with:
```
Contract Address: 0x1234...5678
Network: Base Sepolia (or Base Mainnet)
```

### 3. Test Minting
In Remix, after deployment:
1. Expand your deployed contract
2. Try `mint` function:
   - `account`: Your wallet address
   - `id`: `1` (Seed Funding tier)
   - `amount`: `1`
   - `data`: `0x`
3. Confirm transaction
4. Check balance with `balanceOf` function

---

## Metadata Setup (Optional)

Create JSON metadata files for each tier at your `baseURI`:

### Example: `1.json` (Seed Funding)
```json
{
  "name": "LianaBanyan Medallion - Seed Funding",
  "description": "Genesis tier medallion representing early project backing and maximum participation stake.",
  "image": "https://yourdomain.com/images/medallion-seed.png",
  "attributes": [
    {
      "trait_type": "Tier",
      "value": "Seed Funding"
    },
    {
      "trait_type": "Max Supply",
      "value": 100
    },
    {
      "trait_type": "Unit Price",
      "value": "$5.00"
    },
    {
      "trait_type": "Participation Potential",
      "value": "Highest"
    }
  ]
}
```

Repeat for tiers 2, 3, and 4 with appropriate values.

---

## Network Information

### Base Sepolia Testnet
- Chain ID: 84532
- RPC URL: `https://sepolia.base.org`
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Base Mainnet (Production)
- Chain ID: 8453
- RPC URL: `https://mainnet.base.org`
- Explorer: https://basescan.org
- Bridge: https://bridge.base.org

---

## Gas Cost Estimates

### Base Sepolia (Testnet)
- Contract deployment: FREE (test ETH)
- Batch mint (100 tokens): FREE

### Base Mainnet (Production)
- Contract deployment: ~$2-5
- Batch mint (100 tokens): ~$0.50-2
- Single mint: ~$0.01-0.05
- **All funded from LB Pool automatically**

---

## Troubleshooting

### "Out of Gas" Error
- Increase gas limit in MetaMask
- Contract deployment needs ~2-3 million gas

### "Invalid Token ID" Error
- Token IDs must be 1, 2, 3, or 4
- Check your mint function calls

### "Exceeds Max Supply" Error
- Tier limits: 100, 250, 500, 1000
- Check `remainingSupply(id)` before minting

---

## Next Steps

Once you have the contract address, tell Jarvis:
> "Contract deployed at 0x1234...5678 on Base Sepolia"

Jarvis will then:
1. Update backend edge functions with contract address
2. Configure minting automation
3. Enable wallet connection in admin UI
4. Link medallion eligibility to smart contract

**Ready to deploy? Start with Method 1 (Remix IDE) - it's the quickest way to get started!** 🚀
