# 💥 Crypto Crash - Backend

A real-time multiplayer "Crash" game where players bet in USD, converted into cryptocurrency using real-time prices. Players must cash out before the game "crashes" at a provably fair multiplier.

---

## 🚀 Features

- Real-time multiplayer crash rounds (every 10s)
- Provably fair crash point generation
- USD to crypto conversion using CoinMarketCap API
- Player wallets in BTC/ETH with USD equivalents
- Simulated blockchain transaction logs
- WebSocket-based live game updates

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **WebSocket**: Socket.IO
- **Database**: MongoDB Atlas
- **Crypto Prices**: CoinMarketCap API

---

## 📦 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/crypto-crash-backend.git
cd crypto-crash-backend
npm install

### 2. Set up .env file
Create a .env file in the root directory with the following:

env
Copy
Edit
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CMC_API_KEY=your_coinmarketcap_api_key
💡 You can get a free API key from https://coinmarketcap.com/api

3. Start the server
bash
Copy
Edit
npm start
📡 API Endpoints
Base URL: http://localhost:5000

📘 Wallet API
GET /api/wallet/:playerId/balance
Returns current wallet balance in BTC/ETH and USD equivalent.

json
Copy
Edit
{
  "BTC": { "crypto": 0.01, "usd": "600.00" },
  "ETH": { "crypto": 0.2, "usd": "500.00" }
}
POST /api/wallet/bet
Place a bet in USD. Deducts equivalent crypto from wallet.

h
Copy
Edit
POST /api/wallet/bet
Content-Type: application/json

{
  "playerId": "64ef13...",
  "usdAmount": 10,
  "currency": "BTC"
}
json
Copy
Edit
{
  "message": "Bet placed",
  "cryptoAmount": 0.00016667
}
🎮 Game API
POST /api/game/cashout
Cash out your bet before the crash point.

http
Copy
Edit
POST /api/game/cashout
Content-Type: application/json

{
  "playerId": "64ef13...",
  "roundId": "123e4567...",
  "multiplier": 2.5
}
json
Copy
Edit
{
  "message": "Cashout successful",
  "payoutUSD": 25,
  "payoutCrypto": 0.00033334
}
🌐 WebSocket Events
📤 Server → Client
Event Name	Payload	Description
roundStart	{ roundId, crashPointHash }	New round starts
multiplierUpdate	{ multiplier }	Sent every 100ms
playerCashout	{ playerId, multiplier, payoutCrypto, payoutUSD }	Player cashed out
roundCrash	{ crashPoint }	Game crashed
betConfirmed	{ cryptoAmount, multiplier }	Bet was accepted

📥 Client → Server
Event Name	Payload	Description
placeBet	{ playerId, usdAmount, currency }	Place a bet
cashout	{ playerId }	Request cashout

🎲 Provably Fair Crash Algorithm
We use a cryptographically secure hash-based algorithm to generate the crash point:

js
Copy
Edit
hash = sha256(seed + roundNumber)
intVal = parseInt(hash.slice(0, 8), 16)
crash = 100 + (intVal % (100 * 100))
crashPoint = crash / 100
Example:
Seed: 'provablyfair_seed_123'

Round Number: timestamp or UUID

Hash: sha256(seed + roundNumber)

Crash Point: Derived from hash → ensures verifiability

Anyone can re-compute the crash point using the provided seed and roundNumber.

💱 USD-to-Crypto Conversion Logic
At time of bet:
js
Copy
Edit
cryptoAmount = usdAmount / cryptoPrice
At cashout:
js
Copy
Edit
payoutCrypto = cryptoAmount * multiplier
payoutUSD = payoutCrypto * currentPrice
Prices are fetched from CoinMarketCap and cached for 10 seconds to reduce API calls.

🧠 Architecture Overview
Game Logic:
Every 10 seconds a new round starts.

Multiplier increases in real-time (e.g., 1 + (elapsed * growth_factor)).

Game crashes at a provably fair multiplier.

Players cash out before crash to win.

Crypto Integration:
Real-time BTC/ETH pricing via CoinMarketCap.

USD → crypto conversion for bets.

Simulated crypto wallet per player.

All transactions are logged with a mock hash.

Real-Time WebSockets:
Game events (start, multiplier, crash, cashout) sent via Socket.IO.

Players place bets and cash out through WebSocket events.


