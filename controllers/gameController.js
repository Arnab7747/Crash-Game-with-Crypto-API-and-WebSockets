const GameRound = require('../models/GameRound');
const Player = require('../models/player');
const Transaction = require('../models/Transaction');
const getCryptoPrice = require('../services/cryptoPrice');
const generateMockHash = require('../utils/generateHash');

// 📌 Cash out
exports.cashOut = async (req, res) => {
  try {
    const { playerId, roundId, multiplier } = req.body;
    const round = await GameRound.findOne({ roundId });
    if (!round) return res.status(404).json({ error: 'Round not found' });

    const bet = round.bets.find(b => b.playerId.toString() === playerId && !b.cashedOut);
    if (!bet) return res.status(400).json({ error: 'Bet not found or already cashed out' });

    if (multiplier >= round.crashPoint) {
      return res.status(400).json({ error: 'Too late, game already crashed' });
    }

    // Calculate payout
    const payoutCrypto = bet.cryptoAmount * multiplier;
    const price = await getCryptoPrice(bet.currency);
    const payoutUSD = payoutCrypto * price;

    // Update player's wallet
    const player = await Player.findById(playerId);
    player.wallet[bet.currency] += payoutCrypto;
    await player.save();

    // Update round bet info
    bet.cashedOut = true;
    bet.multiplierAtCashout = multiplier;
    bet.payoutCrypto = payoutCrypto;
    bet.payoutUSD = payoutUSD;
    await round.save();

    // Save transaction
    const tx = new Transaction({
      playerId,
      usdAmount: payoutUSD,
      cryptoAmount: payoutCrypto,
      currency: bet.currency,
      transactionType: 'cashout',
      transactionHash: generateMockHash(),
      priceAtTime: price
    });
    await tx.save();

    res.json({ message: 'Cashout successful', payoutUSD, payoutCrypto });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
