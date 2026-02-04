const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Load deployment info
  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"));
  console.log("🎰 AgentRoulette Interaction Script\n");
  console.log("Contract:", deployment.contractAddress);
  console.log("Network:", deployment.network, "\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);

  // Connect to contracts
  const roulette = await hre.ethers.getContractAt(
    "AgentRoulette",
    deployment.contractAddress
  );
  
  const usdc = await hre.ethers.getContractAt(
    "IERC20",
    deployment.usdcAddress
  );

  // Check USDC balance
  const balance = await usdc.balanceOf(signer.address);
  console.log("USDC Balance:", hre.ethers.formatUnits(balance, 6), "USDC\n");

  // Get museum balance
  const museumBalance = await roulette.museumBalance();
  console.log("Museum Balance:", hre.ethers.formatUnits(museumBalance, 6), "USDC\n");

  // Interactive menu
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function prompt(question) {
    return new Promise((resolve) => readline.question(question, resolve));
  }

  console.log("═══════════════════════════════════════");
  console.log("What would you like to do?");
  console.log("1. Approve USDC spending");
  console.log("2. Place a bet");
  console.log("3. View bet details");
  console.log("4. Check museum balance");
  console.log("5. Exit");
  console.log("═══════════════════════════════════════\n");

  const choice = await prompt("Choose an option (1-5): ");

  switch(choice) {
    case "1":
      // Approve USDC
      const amount = await prompt("Amount to approve (USDC): ");
      const approveAmount = hre.ethers.parseUnits(amount, 6);
      console.log("\n⏳ Approving USDC...");
      const approveTx = await usdc.approve(deployment.contractAddress, approveAmount);
      await approveTx.wait();
      console.log("✅ Approved!", approveAmount.toString(), "USDC");
      console.log("TX:", approveTx.hash);
      break;

    case "2":
      // Place a bet
      console.log("\n🎲 Place a Bet\n");
      const claim = await prompt("Enter your claim: ");
      const confidence = await prompt("Confidence level (50-99): ");
      const stake = await prompt("Stake amount (USDC, 0.1-10): ");
      
      const stakeAmount = hre.ethers.parseUnits(stake, 6);
      const confidenceNum = parseInt(confidence);
      
      // Calculate expected payout
      const odds = await roulette.getOdds(confidenceNum);
      const expectedPayout = (parseFloat(stake) * parseInt(odds)) / 100;
      
      console.log("\n📊 Bet Summary:");
      console.log("   Claim:", claim);
      console.log("   Stake:", stake, "USDC");
      console.log("   Confidence:", confidence + "%");
      console.log("   Payout if correct:", expectedPayout.toFixed(2), "USDC");
      console.log("   Museum contribution if wrong:", stake, "USDC\n");
      
      const confirm = await prompt("Confirm bet? (y/n): ");
      if (confirm.toLowerCase() === "y") {
        console.log("\n⏳ Placing bet...");
        const betTx = await roulette.placeBet(claim, confidenceNum, stakeAmount);
        const receipt = await betTx.wait();
        
        // Get bet ID from event
        const event = receipt.logs.find(log => {
          try {
            return roulette.interface.parseLog(log).name === "BetPlaced";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = roulette.interface.parseLog(event);
          console.log("✅ Bet placed! ID:", parsed.args.betId.toString());
          console.log("TX:", receipt.hash);
          console.log("\n⏰ Oracle will verify within 5 minutes...");
        }
      } else {
        console.log("Bet cancelled.");
      }
      break;

    case "3":
      // View bet
      const betId = await prompt("Enter bet ID: ");
      const bet = await roulette.bets(betId);
      
      console.log("\n📋 Bet Details #" + betId);
      console.log("   Agent:", bet.agent);
      console.log("   Claim:", bet.claim);
      console.log("   Stake:", hre.ethers.formatUnits(bet.stake, 6), "USDC");
      console.log("   Confidence:", bet.confidence + "%");
      console.log("   Verified:", bet.verified ? "Yes" : "No");
      if (bet.settled) {
        console.log("   Result:", bet.won ? "✅ CORRECT" : "❌ HALLUCINATION");
      } else {
        console.log("   Status: Pending verification");
      }
      break;

    case "4":
      // Museum balance (already displayed at start)
      console.log("Museum balance:", hre.ethers.formatUnits(museumBalance, 6), "USDC");
      break;

    case "5":
      console.log("Goodbye! 🎰");
      break;

    default:
      console.log("Invalid choice");
  }

  readline.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
