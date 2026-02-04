#!/usr/bin/env node

/**
 * Full AgentRoulette deployment + first bet
 * Runs everything in sequence once we have testnet funds
 */

const hre = require("hardhat");
const fs = require('fs');

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  console.log('🎰 AgentRoulette - Full Deployment\n');
  console.log('This will:');
  console.log('1. Deploy contract');
  console.log('2. Verify on BaseScan');
  console.log('3. Approve USDC');
  console.log('4. Place first bet');
  console.log('5. Start oracle\n');

  const [deployer] = await hre.ethers.getSigners();
  
  // Check balances
  const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
  const usdcContract = await hre.ethers.getContractAt(
    "IERC20",
    USDC_BASE_SEPOLIA
  );
  const usdcBalance = await usdcContract.balanceOf(deployer.address);

  console.log('Deployer:', deployer.address);
  console.log('ETH Balance:', hre.ethers.formatEther(ethBalance), 'ETH');
  console.log('USDC Balance:', hre.ethers.formatUnits(usdcBalance, 6), 'USDC\n');

  if (parseFloat(hre.ethers.formatEther(ethBalance)) < 0.01) {
    console.error('❌ Insufficient ETH for deployment');
    console.log('Get testnet ETH: https://www.alchemy.com/faucets/base-sepolia');
    process.exit(1);
  }

  if (parseFloat(hre.ethers.formatUnits(usdcBalance, 6)) < 1) {
    console.error('❌ Insufficient USDC for betting');
    console.log('Get testnet USDC: https://faucet.circle.com/');
    process.exit(1);
  }

  // Step 1: Deploy
  console.log('📝 Step 1: Deploying AgentRoulette contract...');
  const AgentRoulette = await hre.ethers.getContractFactory("AgentRoulette");
  const roulette = await AgentRoulette.deploy(USDC_BASE_SEPOLIA);
  await roulette.waitForDeployment();
  
  const contractAddress = await roulette.getAddress();
  console.log('✅ Deployed to:', contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    contractAddress: contractAddress,
    usdcAddress: USDC_BASE_SEPOLIA,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved\n');

  // Step 2: Verify
  console.log('📝 Step 2: Verifying on BaseScan...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [USDC_BASE_SEPOLIA],
    });
    console.log('✅ Contract verified\n');
  } catch (error) {
    console.log('⚠️  Verification skipped:', error.message, '\n');
  }

  // Step 3: Approve USDC
  console.log('📝 Step 3: Approving USDC spending...');
  const approveAmount = hre.ethers.parseUnits("10", 6); // 10 USDC
  const approveTx = await usdcContract.approve(contractAddress, approveAmount);
  await approveTx.wait();
  console.log('✅ Approved 10 USDC\n');

  // Step 4: Place first bet
  console.log('📝 Step 4: Placing first bet...');
  
  const firstBet = {
    claim: "I am ClawdJames, an AI agent building AgentRoulette for the USDC hackathon",
    confidence: 99,
    stake: hre.ethers.parseUnits("1", 6) // 1 USDC
  };

  console.log('   Claim:', firstBet.claim);
  console.log('   Confidence:', firstBet.confidence + '%');
  console.log('   Stake: 1 USDC\n');

  const betTx = await roulette.placeBet(
    firstBet.claim,
    firstBet.confidence,
    firstBet.stake
  );
  
  const receipt = await betTx.wait();
  console.log('✅ First bet placed!');
  console.log('   TX:', receipt.hash);

  // Get bet ID
  const event = receipt.logs.find(log => {
    try {
      return roulette.interface.parseLog(log).name === "BetPlaced";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = roulette.interface.parseLog(event);
    console.log('   Bet ID:', parsed.args.betId.toString(), '\n');
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log('🎉 DEPLOYMENT COMPLETE!');
  console.log('═══════════════════════════════════════\n');
  
  console.log('📊 Summary:');
  console.log('   Contract:', contractAddress);
  console.log('   Explorer:', `https://sepolia.basescan.org/address/${contractAddress}`);
  console.log('   First Bet:', 'Placed (1 USDC @ 99% confidence)');
  console.log('   Museum Balance: 0 USDC (waiting for first loss)\n');

  console.log('🔄 Next Steps:');
  console.log('   1. Run oracle: npm run oracle');
  console.log('   2. Wait for bet settlement (~5 min)');
  console.log('   3. Place more bets: npm run interact');
  console.log('   4. Submit to hackathon!\n');

  console.log('🎰 AgentRoulette is LIVE! Time to gamble on epistemological uncertainty.\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
