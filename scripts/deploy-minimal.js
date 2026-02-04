const hre = require("hardhat");

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  console.log('🎰 AgentRoulette - Minimal Deployment\n');

  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with:', deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('ETH Balance:', hre.ethers.formatEther(balance), 'ETH\n');

  // Deploy contract only
  console.log('📝 Deploying AgentRoulette contract...');
  const AgentRoulette = await hre.ethers.getContractFactory("AgentRoulette");
  const roulette = await AgentRoulette.deploy(USDC_BASE_SEPOLIA);
  
  await roulette.waitForDeployment();
  const address = await roulette.getAddress();
  
  console.log('✅ AgentRoulette deployed to:', address);
  console.log('   USDC address:', USDC_BASE_SEPOLIA);
  console.log('\n🔗 View on BaseScan:');
  console.log(`   https://sepolia.basescan.org/address/${address}\n`);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "baseSepolia",
    contractAddress: address,
    usdcAddress: USDC_BASE_SEPOLIA,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to deployment.json\n');
  
  console.log('🎉 Deployment complete!\n');
  console.log('Next steps:');
  console.log('1. Get more testnet ETH for verification');
  console.log('2. Approve USDC: npm run interact');
  console.log('3. Place bets manually or wait for more gas\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
