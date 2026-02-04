# 🎰 AgentRoulette Testnet Wallet

**Generated:** 2026-02-03 19:24 PST  
**Purpose:** AgentRoulette hackathon project  
**Network:** Base Sepolia (testnet)

---

## 📋 Wallet Details

**Address:** `0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed`

**Private Key:** `0x53da17e76235a97f4321853e8a30cf7a15db8c6052cb488357056d6ee849ae66`

**Mnemonic:** `nurse model twelve swing decrease school museum estate churn improve own material`

⚠️ **TESTNET ONLY** - This wallet is for Base Sepolia testnet only. Never send real funds to this address!

---

## 🚰 Get Testnet Assets (DO THESE NOW)

### Step 1: Get Base Sepolia ETH (for gas)

**Option A - Alchemy Faucet (RECOMMENDED):**
1. Go to: https://www.alchemy.com/faucets/base-sepolia
2. Enter wallet address: `0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed`
3. Complete captcha
4. Request 0.1 ETH
5. Wait ~30 seconds for confirmation

**Option B - Coinbase Faucet:**
1. Go to: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Enter wallet address: `0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed`
3. Complete verification
4. Request ETH

**Option C - LearnWeb3 Faucet:**
1. Go to: https://learnweb3.io/faucets/base_sepolia
2. Enter wallet address: `0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed`
3. Request ETH

---

### Step 2: Get Circle USDC (for betting)

**Circle Faucet:**
1. Go to: https://faucet.circle.com/
2. Select network: **Base Sepolia**
3. Enter wallet address: `0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed`
4. Request USDC
5. Should receive 10 testnet USDC

**USDC Contract on Base Sepolia:**  
`0x036CbD53842c5426634e7929541eC2318f3dCF7e`

---

## ✅ Verification Checklist

After requesting from faucets, check balances:

**Check ETH Balance:**
```bash
# View on BaseScan
https://sepolia.basescan.org/address/0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed

# Or via CLI
cd agent-roulette
node -e "const ethers = require('ethers'); const provider = new ethers.JsonRpcProvider('https://sepolia.base.org'); provider.getBalance('0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed').then(b => console.log('ETH:', ethers.formatEther(b)));"
```

**Check USDC Balance:**
```bash
node -e "const ethers = require('ethers'); const provider = new ethers.JsonRpcProvider('https://sepolia.base.org'); const abi = ['function balanceOf(address) view returns (uint256)']; const usdc = new ethers.Contract('0x036CbD53842c5426634e7929541eC2318f3dCF7e', abi, provider); usdc.balanceOf('0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed').then(b => console.log('USDC:', ethers.formatUnits(b, 6)));"
```

---

## 🚀 Once You Have Funds

**Tell me when both ETH and USDC are confirmed**, then I'll:

1. ✅ Deploy AgentRoulette contract
2. ✅ Verify on BaseScan
3. ✅ Place first on-chain bet
4. ✅ Run oracle to settle it
5. ✅ Submit to hackathon

---

## 🔗 Quick Links

- **Wallet on BaseScan:** https://sepolia.basescan.org/address/0x6d159F5F6aD9DC3ceb139E6779D3Bb1DD972D2Ed
- **Base Sepolia Explorer:** https://sepolia.basescan.org
- **Network Info:** https://docs.base.org/network-information

---

**Status:** ⏳ Waiting for testnet funds

Once funded, we're literally one command away from deploying. 🔥
