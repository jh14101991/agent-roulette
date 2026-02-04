#!/usr/bin/env node

/**
 * AgentRoulette Oracle Server
 * Listens for new bets and verifies claims automatically
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ORACLE_CHECK_INTERVAL = 15000; // Check every 15 seconds

class OracleServer {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.deployment = null;
  }

  async init() {
    console.log('🎰 AgentRoulette Oracle Server\n');

    // Load deployment info
    const deploymentPath = path.join(__dirname, '..', 'deployment.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error('deployment.json not found. Deploy contract first!');
    }
    this.deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    console.log('Contract:', this.deployment.contractAddress);
    console.log('Network:', this.deployment.network, '\n');

    // Connect to provider
    const rpcUrl = process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Setup wallet
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not set in .env');
    }
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    console.log('Oracle address:', this.wallet.address);

    const balance = await this.provider.getBalance(this.wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH\n');

    // Connect to contract
    const abi = [
      "function bets(uint256) view returns (address agent, string claim, uint256 stake, uint8 confidence, uint256 timestamp, bool verified, bool won, bool settled)",
      "function betCounter() view returns (uint256)",
      "function settleBet(uint256 betId, bool isCorrect) external",
      "function museumBalance() view returns (uint256)",
      "event BetPlaced(uint256 indexed betId, address indexed agent, string claim, uint256 stake, uint8 confidence)",
      "event BetSettled(uint256 indexed betId, bool won, uint256 payout)"
    ];

    this.contract = new ethers.Contract(
      this.deployment.contractAddress,
      abi,
      this.wallet
    );

    console.log('✅ Oracle initialized\n');
  }

  async verifyClaim(claim) {
    console.log(`🔍 Verifying: "${claim}"\n`);

    // For demo purposes, we'll use simple heuristics
    // In production, this would call web search APIs, fact-checking services, etc.

    // Simple checks:
    const lowerClaim = claim.toLowerCase();
    
    // Obviously true statements
    if (
      lowerClaim.includes('earth') && lowerClaim.includes('round') ||
      lowerClaim.includes('water is wet') ||
      lowerClaim.includes('2 + 2 = 4')
    ) {
      return {
        isCorrect: true,
        confidence: 100,
        reasoning: 'Trivially true statement'
      };
    }

    // Obviously false statements
    if (
      lowerClaim.includes('earth is flat') ||
      lowerClaim.includes('2 + 2 = 5')
    ) {
      return {
        isCorrect: false,
        confidence: 100,
        reasoning: 'Trivially false statement'
      };
    }

    // Default: assume hallucination (conservative approach)
    // In production, this would do real verification
    console.log('⚠️  Unable to verify with high confidence');
    console.log('   Conservative approach: marking as hallucination\n');
    
    return {
      isCorrect: false,
      confidence: 50,
      reasoning: 'Unable to verify - conservative judgment'
    };
  }

  async processBet(betId) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Processing Bet #${betId}`);
    console.log('═'.repeat(60));

    try {
      const bet = await this.contract.bets(betId);
      
      if (bet.settled) {
        console.log('⏭️  Already settled, skipping');
        return;
      }

      console.log('\n📋 Bet Details:');
      console.log('   Agent:', bet.agent);
      console.log('   Claim:', bet.claim);
      console.log('   Stake:', ethers.formatUnits(bet.stake, 6), 'USDC');
      console.log('   Confidence:', bet.confidence + '%');
      console.log('   Timestamp:', new Date(Number(bet.timestamp) * 1000).toISOString());

      // Check if verification window expired
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = Number(bet.timestamp) + 300 - now; // 5 min window
      
      if (timeLeft < 0) {
        console.log('\n⏰ Verification window expired!');
        return;
      }

      console.log(`\n⏰ Time left for verification: ${timeLeft}s`);

      // Verify the claim
      const verdict = await this.verifyClaim(bet.claim);
      
      console.log('\n📊 Verdict:');
      console.log('   Result:', verdict.isCorrect ? '✅ CORRECT' : '❌ HALLUCINATION');
      console.log('   Confidence:', verdict.confidence + '%');
      console.log('   Reasoning:', verdict.reasoning);

      // Settle on-chain
      console.log('\n⛓️  Settling bet on-chain...');
      const tx = await this.contract.settleBet(betId, verdict.isCorrect);
      console.log('   TX sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('   ✅ Confirmed in block:', receipt.blockNumber);

      if (verdict.isCorrect) {
        console.log('\n🎉 Agent won the bet!');
      } else {
        console.log('\n🎨 Hallucination added to museum!');
        const museumBalance = await this.contract.museumBalance();
        console.log('   Museum balance:', ethers.formatUnits(museumBalance, 6), 'USDC');
      }

    } catch (error) {
      console.error('\n❌ Error processing bet:', error.message);
    }
  }

  async checkForNewBets() {
    try {
      const betCounter = await this.contract.betCounter();
      const count = Number(betCounter);

      if (count === 0) {
        return;
      }

      // Check last few bets for any unsettled ones
      const checksNeeded = Math.min(count, 10); // Check last 10 bets max
      for (let i = count - checksNeeded; i < count; i++) {
        const bet = await this.contract.bets(i);
        if (!bet.settled) {
          await this.processBet(i);
        }
      }

    } catch (error) {
      console.error('Error checking bets:', error.message);
    }
  }

  async start() {
    console.log('👂 Oracle is listening for new bets...\n');
    console.log(`   Checking every ${ORACLE_CHECK_INTERVAL / 1000}s`);
    console.log('   Press Ctrl+C to stop\n');

    // Initial check
    await this.checkForNewBets();

    // Poll for new bets
    setInterval(async () => {
      await this.checkForNewBets();
    }, ORACLE_CHECK_INTERVAL);

    // Also listen for events in real-time
    this.contract.on('BetPlaced', async (betId, agent, claim, stake, confidence) => {
      console.log(`\n🔔 New bet detected! #${betId}`);
      // Wait a bit to let the transaction confirm
      setTimeout(async () => {
        await this.processBet(Number(betId));
      }, 5000);
    });
  }
}

// Run the server
async function main() {
  const oracle = new OracleServer();
  
  try {
    await oracle.init();
    await oracle.start();
  } catch (error) {
    console.error('❌ Oracle failed to start:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = OracleServer;
