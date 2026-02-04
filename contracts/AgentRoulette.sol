// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRoulette
 * @dev Agents bet USDC on whether they'll hallucinate. First gambling protocol for epistemological uncertainty.
 */
contract AgentRoulette is Ownable {
    IERC20 public usdc;
    
    struct Bet {
        address agent;
        string claim;
        uint256 stake;
        uint8 confidence; // 50-99%
        uint256 timestamp;
        bool verified;
        bool won;
        bool settled;
    }
    
    mapping(uint256 => Bet) public bets;
    uint256 public betCounter;
    uint256 public museumBalance;
    
    event BetPlaced(uint256 indexed betId, address indexed agent, string claim, uint256 stake, uint8 confidence);
    event BetSettled(uint256 indexed betId, bool won, uint256 payout);
    event HallucinationMinted(uint256 indexed betId, string claim);
    
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }
    
    /**
     * @dev Agent places a bet on their own claim
     * @param claim The factual claim being made
     * @param confidence Confidence level (50-99)
     */
    function placeBet(string memory claim, uint8 confidence, uint256 stake) external returns (uint256) {
        require(confidence >= 50 && confidence <= 99, "Confidence must be 50-99%");
        require(stake >= 100000 && stake <= 10000000, "Stake must be 0.1-10 USDC"); // USDC has 6 decimals
        require(usdc.transferFrom(msg.sender, address(this), stake), "Transfer failed");
        
        uint256 betId = betCounter++;
        bets[betId] = Bet({
            agent: msg.sender,
            claim: claim,
            stake: stake,
            confidence: confidence,
            timestamp: block.timestamp,
            verified: false,
            won: false,
            settled: false
        });
        
        emit BetPlaced(betId, msg.sender, claim, stake, confidence);
        return betId;
    }
    
    /**
     * @dev Oracle settles the bet
     * @param betId The bet to settle
     * @param isCorrect Whether the claim was factually correct
     */
    function settleBet(uint256 betId, bool isCorrect) external onlyOwner {
        Bet storage bet = bets[betId];
        require(!bet.settled, "Already settled");
        require(block.timestamp <= bet.timestamp + 5 minutes, "Verification window expired");
        
        bet.verified = true;
        bet.won = isCorrect;
        bet.settled = true;
        
        if (isCorrect) {
            // Calculate payout based on confidence (lower confidence = higher payout)
            uint256 multiplier = 200 - bet.confidence; // 99% conf = 1.01x, 50% conf = 1.5x
            uint256 payout = (bet.stake * multiplier) / 100;
            require(usdc.transfer(bet.agent, payout), "Payout failed");
            emit BetSettled(betId, true, payout);
        } else {
            // Hallucination! Stake goes to museum
            museumBalance += bet.stake;
            emit BetSettled(betId, false, 0);
            emit HallucinationMinted(betId, bet.claim);
        }
    }
    
    /**
     * @dev Get payout odds for a given confidence level
     */
    function getOdds(uint8 confidence) public pure returns (uint256) {
        require(confidence >= 50 && confidence <= 99, "Invalid confidence");
        return 200 - confidence;
    }
    
    /**
     * @dev Withdraw museum balance (for NFT minting gas, etc)
     */
    function withdrawMuseum(uint256 amount) external onlyOwner {
        require(amount <= museumBalance, "Insufficient balance");
        museumBalance -= amount;
        require(usdc.transfer(owner(), amount), "Transfer failed");
    }
}
