const mongoose = require('mongoose');

const GameRoundSchema = new mongoose.Schema({
  roundId: String,
  crashPoint: Number,
  startTime: Date,
  endTime: Date,
  bets: [{
    playerId: mongoose.Schema.Types.ObjectId,
    usdAmount: Number,
    cryptoAmount: Number,
    currency: String,
    cashedOut: Boolean,
    multiplierAtCashout: Number,
    payoutCrypto: Number,
    payoutUSD: Number
  }]
});

module.exports = mongoose.model('GameRound', GameRoundSchema);
