const { ethers } = require('ethers');
require('dotenv').config();

// Sepolia L1 Standard Bridge (official Base bridge)
const L1_STANDARD_BRIDGE = '0xfd0Bf71F60660E2f608ed56e1659C450eB113120';

async function main() {
  console.log('🌉 Bridging ETH from Sepolia to Base Sepolia\n');

  // Connect to Sepolia (using public RPC)
  const sepoliaProvider = new ethers.JsonRpcProvider('https://rpc2.sepolia.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, sepoliaProvider);

  console.log('Wallet:', wallet.address);
  
  // Check balance
  const balance = await sepoliaProvider.getBalance(wallet.address);
  console.log('Sepolia Balance:', ethers.formatEther(balance), 'ETH\n');

  if (parseFloat(ethers.formatEther(balance)) < 0.01) {
    console.error('❌ Insufficient balance');
    process.exit(1);
  }

  // Bridge contract ABI (minimal)
  const bridgeAbi = [
    'function depositETH(uint32 _minGasLimit, bytes calldata _extraData) external payable'
  ];

  const bridge = new ethers.Contract(L1_STANDARD_BRIDGE, bridgeAbi, wallet);

  const amountToBridge = ethers.parseEther('0.05'); // Bridge 0.05 ETH
  const minGasLimit = 200000; // Standard gas limit for L2

  console.log('Bridging', ethers.formatEther(amountToBridge), 'ETH to Base Sepolia...');
  console.log('This will take ~10 minutes to complete\n');

  try {
    const tx = await bridge.depositETH(minGasLimit, '0x', {
      value: amountToBridge,
      gasLimit: 100000
    });

    console.log('✅ Bridge transaction sent!');
    console.log('TX Hash:', tx.hash);
    console.log('View on Etherscan:', `https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log('\n⏰ Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('✅ Confirmed in block:', receipt.blockNumber);
    console.log('\n🎉 Bridge initiated!');
    console.log('Wait ~10 minutes, then run: npm run balance');
    console.log('Your ETH will appear on Base Sepolia\n');

  } catch (error) {
    console.error('❌ Bridge failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
