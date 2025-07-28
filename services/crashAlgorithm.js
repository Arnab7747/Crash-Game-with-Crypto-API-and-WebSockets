const crypto = require('crypto');

const generateCrashPoint = (seed, roundNumber) => {
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const intVal = parseInt(hash.slice(0, 8), 16); // 32-bit slice
  const maxCrash = 100 * 100; // 100x, represented in hundredths
  const crash = 100 + (intVal % maxCrash); // 1.00x to 100.99x
  return (crash / 100).toFixed(2);
};

module.exports = generateCrashPoint;
