const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/cashout', gameController.cashOut);

module.exports = router;
