const { v4: uuidv4 } = require('uuid');
const GameRound = require('../models/GameRound');
const Player = require('../models/player');
const getCryptoPrice = require('../services/cryptoPrice');
const generateCrashPoint = require('../services/crashAlgorithm');
const generateMockHash = require('../utils/generateHash');

module.exports = (io) => {
  let currentRound = null;
  let seed = 'provablyfair_seed_123'; // Replace with dynamic hash in production
  let multiplier = 1.0;
  let startTime;
  let interval;
  let roundActive = false;

  const startNewRound = async () => {
    const roundId = uuidv4();
    const roundNumber = Date.now();
    const crashPoint = parseFloat(generateCrashPoint(seed, roundNumber));

    currentRound = new GameRound({
      roundId,
      crashPoint,
      startTime: new Date(),
      bets: []
    });

    await currentRound.save();

    multiplier = 1.0;
    roundActive = true;
    startTime = Date.now();

    io.emit('roundStart', { roundId, crashPointHash: crashPoint });

    // Start multiplier loop
    interval = setInterval(async () => {
      const elapsed = (Date.now() - startTime) / 1000;
      multiplier = (1 + elapsed * 0.05).toFixed(2); // simple growth factor

      io.emit('multiplierUpdate', { multiplier });

      if (multiplier >= crashPoint) {
        await endRound();
      }
    }, 100);
  };

  const endRound = async () => {
    clearInterval(interval);
    roundActive = false;

    currentRound.endTime = new Date();
    await currentRound.save();

    io.emit('roundCrash', { crashPoint: currentRound.crashPoint });

    // Start next round after 10s
    setTimeout(() => startNewRound(), 10000);
  };

  io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Player places a bet (simulated)
    socket.on('placeBet', async ({ playerId, usdAmount, currency }) => {
      if (!roundActive || !currentRound) return;

      const player = await Player.findById(playerId);
      const price = await getCryptoPrice(currency);
      const cryptoAmount = usdAmount / price;

      if (player.wallet[currency] < cryptoAmount) {
        return socket.emit('error', 'Insufficient balance');
      }

      // Deduct crypto
      player.wallet[currency] -= cryptoAmount;
      await player.save();

      // Save bet to round
      currentRound.bets.push({
        playerId,
        usdAmount,
        cryptoAmount,
        currency,
        cashedOut: false
      });
      await currentRound.save();

      socket.emit('betConfirmed', { cryptoAmount, multiplier });
    });

    // Cashout request
    socket.on('cashout', async ({ playerId }) => {
      if (!roundActive || !currentRound) return;

      const bet = currentRound.bets.find(b => b.playerId.toString() === playerId && !b.cashedOut);
      if (!bet) return;

      if (multiplier >= currentRound.crashPoint) return;

      const payoutCrypto = bet.cryptoAmount * multiplier;
      const price = await getCryptoPrice(bet.currency);
      const payoutUSD = payoutCrypto * price;

      const player = await Player.findById(playerId);
      player.wallet[bet.currency] += payoutCrypto;
      await player.save();

      bet.cashedOut = true;
      bet.multiplierAtCashout = multiplier;
      bet.payoutCrypto = payoutCrypto;
      bet.payoutUSD = payoutUSD;
      await currentRound.save();

      io.emit('playerCashout', {
        playerId,
        multiplier,
        payoutCrypto,
        payoutUSD
      });
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
    });
  });

  // Kickstart the game
  startNewRound();
};
