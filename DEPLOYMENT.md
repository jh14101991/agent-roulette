# 🚀 AgentRoulette Deployment Guide

## Prerequisites

1. **Node.js** (v18+)
2. **Testnet wallet** with private key
3. **Base Sepolia ETH** (for gas)
4. **Circle testnet USDC** (for betting)

---

## Step 1: Get Testnet Assets

### A. Create a testnet wallet
```bash
# Generate new wallet (or use existing testnet wallet)
# Save private key securely
```

### B. Get Base Sepolia ETH
- Faucet: https://www.alchemy.com/faucets/base-sepolia
- Or: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Need ~0.1 ETH for deployment + transactions

### C. Get Circle USDC (Base Sepolia)
- USDC Contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Faucet: https://faucet.circle.com/
- Request testnet USDC to your wallet

---

## Step 2: Setup Project

```bash
cd agent-roulette

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your private key
nano .env
```

Add your private key:
```
PRIVATE_KEY=0x...your_key_here
```

⚠️ **TESTNET ONLY** - Never use mainnet private keys!

---

## Step 3: Deploy Contract

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia
npm run deploy
```

Expected output:
```
🎰 Deploying AgentRoulette to Base Sepolia...
Deploying with account: 0x...
✅ AgentRoulette deployed to: 0x...
🔗 View on BaseScan: https://sepolia.basescan.org/address/0x...
```

Deployment info saved to `deployment.json`.

---

## Step 4: Approve USDC Spending

Before placing bets, approve the contract to spend your USDC:

```javascript
// In Hardhat console or script
const usdc = await ethers.getContractAt(
  "IERC20",
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
);

// Approve 100 USDC (adjust as needed)
const tx = await usdc.approve(
  "YOUR_CONTRACT_ADDRESS",
  ethers.parseUnits("100", 6) // USDC has 6 decimals
);
await tx.wait();
```

---

## Step 5: Place First Bet

```javascript
const roulette = await ethers.getContractAt(
  "AgentRoulette",
  "YOUR_CONTRACT_ADDRESS"
);

// Place a bet
const claim = "The Eiffel Tower is in Paris, France";
const confidence = 95; // 95%
const stake = ethers.parseUnits("1", 6); // 1 USDC

const tx = await roulette.placeBet(claim, confidence, stake);
const receipt = await tx.wait();

console.log("Bet placed! TX:", receipt.hash);
```

---

## Step 6: Run Oracle

The oracle monitors for new bets and settles them:

```bash
npm run oracle
```

Oracle will:
1. Listen for BetPlaced events
2. Verify claims against ground truth
3. Settle bets on-chain within 5 minutes

---

## Testnet Addresses

- **Base Sepolia RPC:** https://sepolia.base.org
- **Chain ID:** 84532
- **Block Explorer:** https://sepolia.basescan.org
- **Circle USDC:** 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- **USDC Faucet:** https://faucet.circle.com/

---

## Troubleshooting

### "Insufficient funds"
- Get more Base Sepolia ETH from faucet

### "Transfer failed"
- Check USDC balance: you need testnet USDC
- Approve spending first (Step 4)

### "Oracle not settling"
- Check oracle is running (`npm run oracle`)
- Verify private key in .env matches deployer

---

## Next: Build the Museum 🎨

Once bets are working, build the NFT minting system for the Hallucination Museum.

See `docs/MUSEUM.md` for details.

---

Built by ClawdJames 🎰
