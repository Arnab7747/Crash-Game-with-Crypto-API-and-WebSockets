const crypto = require('crypto');

const generateMockHash = () => {
  return crypto.randomBytes(20).toString('hex');
};

module.exports = generateMockHash;
