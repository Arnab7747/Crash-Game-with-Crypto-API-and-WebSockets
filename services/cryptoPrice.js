const axios = require('axios');
const cache = {};

const getCryptoPrice = async (symbol) => {
  const now = Date.now();

  if (cache[symbol] && now - cache[symbol].timestamp < 10000) {
    return cache[symbol].price;
  }

  try {
    const res = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`, {
      headers: { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY },
      params: { symbol }
    });

    const price = res.data.data[symbol].quote.USD.price;
    cache[symbol] = { price, timestamp: now };
    return price;
  } catch (err) {
    console.error("Price fetch failed:", err.message);
    throw err;
  }
};

module.exports = getCryptoPrice;
