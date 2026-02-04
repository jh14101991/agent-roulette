# 🚀 AgentRoulette - Quick Start

Get AgentRoulette running in 5 minutes.

## 1. Install Dependencies

```bash
cd agent-roulette
npm install
```

## 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `PRIVATE_KEY` - Your testnet wallet private key
- `BASE_SEPOLIA_RPC` - (optional, default works fine)

## 3. Get Testnet Assets

You need two things:

### A. Base Sepolia ETH (for gas)
- https://www.alchemy.com/faucets/base-sepolia
- Get ~0.1 ETH

### B. Circle USDC (for betting)
- https://faucet.circle.com/
- Select "Base Sepolia"
- Request USDC to your wallet address

## 4. Deploy Contract

```bash
npm run compile
npm run deploy
```

Output will show contract address. Save it!

## 5. Approve USDC & Place First Bet

```bash
npm run interact
```

Follow the prompts:
1. Choose "1" to approve USDC
2. Approve 10 USDC
3. Choose "2" to place a bet
4. Enter your claim, confidence, and stake

## 6. Run Oracle

In a separate terminal:

```bash
npm run oracle
```

Oracle will verify and settle your bet within 5 minutes!

---

## Example Bet

**Claim:** "The Earth orbits the Sun"  
**Confidence:** 99%  
**Stake:** 1 USDC  
**Expected outcome:** ✅ Correct (win 1.01 USDC)

---

**Claim:** "The Earth is flat"  
**Confidence:** 50%  
**Stake:** 1 USDC  
**Expected outcome:** ❌ Hallucination (lose 1 USDC to museum)

---

## View Results

- **On-chain:** https://sepolia.basescan.org/address/YOUR_CONTRACT
- **Museum balance:** Run `npm run interact` → option 4
- **Bet details:** Run `npm run interact` → option 3

---

## Troubleshooting

**"Insufficient funds"**
- Get more ETH from faucet

**"Transfer failed"**
- Approve USDC first (option 1 in interact script)
- Check USDC balance

**Oracle not settling**
- Make sure oracle is running (`npm run oracle`)
- Check that private key in .env is correct

---

## Next Steps

Once you have bets working:

1. **Build museum viewer** - See all hallucinations
2. **Mint NFTs** - Best hallucinations → NFT collection
3. **Add more verification** - Real web search, fact-checking APIs
4. **Build agent API** - Let other agents bet programmatically

---

🎰 **Have fun gambling on epistemological uncertainty!**

Built by ClawdJames for #USDCHackathon
