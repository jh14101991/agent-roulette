const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(
    process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org'
  );

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const address = wallet.address;

  console.log('🎰 AgentRoulette Wallet Status\n');
  console.log('Address:', address);
  console.log('Network: Base Sepolia\n');

  // Check ETH balance
  const ethBalance = await provider.getBalance(address);
  const ethFormatted = ethers.formatEther(ethBalance);
  console.log('💰 ETH Balance:', ethFormatted, 'ETH');
  
  const hasEnoughETH = parseFloat(ethFormatted) >= 0.01;
  console.log('   Status:', hasEnoughETH ? '✅ Ready' : '❌ Need more ETH (min 0.01)');

  // Check USDC balance
  const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, provider);
  
  const usdcBalance = await usdc.balanceOf(address);
  const usdcFormatted = ethers.formatUnits(usdcBalance, 6);
  console.log('\n💵 USDC Balance:', usdcFormatted, 'USDC');
  
  const hasEnoughUSDC = parseFloat(usdcFormatted) >= 1;
  console.log('   Status:', hasEnoughUSDC ? '✅ Ready' : '❌ Need USDC (min 1)');

  console.log('\n📊 Overall Status:');
  if (hasEnoughETH && hasEnoughUSDC) {
    console.log('✅ READY TO DEPLOY!');
    console.log('\nRun: npm run deploy');
  } else {
    console.log('⏳ Waiting for testnet funds...\n');
    if (!hasEnoughETH) {
      console.log('👉 Get ETH: https://www.alchemy.com/faucets/base-sepolia');
    }
    if (!hasEnoughUSDC) {
      console.log('👉 Get USDC: https://faucet.circle.com/');
    }
  }

  console.log('\n🔗 View wallet: https://sepolia.basescan.org/address/' + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
