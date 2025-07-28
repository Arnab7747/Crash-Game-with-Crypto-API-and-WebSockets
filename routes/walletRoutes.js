const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/:playerId/balance', walletController.getBalance);
router.post('/bet', walletController.placeBet);

module.exports = router;
