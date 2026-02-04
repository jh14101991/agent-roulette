const hre = require("hardhat");

// Circle USDC on Base Sepolia
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  console.log("🎰 Deploying AgentRoulette to Base Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  console.log("Deploying AgentRoulette contract...");
  const AgentRoulette = await hre.ethers.getContractFactory("AgentRoulette");
  const roulette = await AgentRoulette.deploy(USDC_BASE_SEPOLIA);
  
  await roulette.waitForDeployment();
  const address = await roulette.getAddress();
  
  console.log("✅ AgentRoulette deployed to:", address);
  console.log("   USDC address:", USDC_BASE_SEPOLIA);
  console.log("\n🔗 View on BaseScan:");
  console.log(`   https://sepolia.basescan.org/address/${address}`);
  
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
  
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Deployment info saved to deployment.json");
  console.log("\n⏳ Waiting 30s before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Verify on BaseScan
  try {
    console.log("\n🔍 Verifying contract on BaseScan...");
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [USDC_BASE_SEPOLIA],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("⚠️  Verification failed (might already be verified)");
    console.log(error.message);
  }
  
  console.log("\n🎰 AgentRoulette is LIVE!");
  console.log("\nNext steps:");
  console.log("1. Get testnet USDC from Circle faucet");
  console.log("2. Approve USDC spending: contract.approve()");
  console.log("3. Place first bet: contract.placeBet()");
  console.log("4. Run oracle: npm run oracle");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
