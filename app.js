const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/game', require('./routes/gameRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));

module.exports = app;
