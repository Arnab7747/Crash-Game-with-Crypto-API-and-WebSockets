const Player = require('../models/player');
const Transaction = require('../models/Transaction');
const getCryptoPrice = require('../services/cryptoPrice');
const generateMockHash = require('../utils/generateHash');

//  Get wallet balance
exports.getBalance = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const btcPrice = await getCryptoPrice('BTC');
    const ethPrice = await getCryptoPrice('ETH');

    res.json({
      BTC: {
        crypto: player.wallet.BTC,
        usd: (player.wallet.BTC * btcPrice).toFixed(2)
      },
      ETH: {
        crypto: player.wallet.ETH,
        usd: (player.wallet.ETH * ethPrice).toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Place a bet (USD → crypto conversion)
exports.placeBet = async (req, res) => {
  try {
    const { playerId, usdAmount, currency } = req.body;
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (usdAmount <= 0) return res.status(400).json({ error: 'Invalid USD amount' });
    if (!['BTC', 'ETH'].includes(currency)) return res.status(400).json({ error: 'Invalid currency' });

    const price = await getCryptoPrice(currency);
    const cryptoAmount = usdAmount / price;

    if (player.wallet[currency] < cryptoAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    player.wallet[currency] -= cryptoAmount;
    await player.save();

    const tx = new Transaction({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: 'bet',
      transactionHash: generateMockHash(),
      priceAtTime: price
    });
    await tx.save();

    res.json({ message: 'Bet placed', cryptoAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
