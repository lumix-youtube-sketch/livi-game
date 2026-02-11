const crypto = require('crypto');

const verifyTelegramWebAppData = (telegramInitData) => {
  const encoded = decodeURIComponent(telegramInitData);
  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN)
    .digest();
  
  const arr = encoded.split('&');
  const hashIndex = arr.findIndex(str => str.startsWith('hash='));
  const hash = arr.splice(hashIndex, 1)[0].split('=')[1];
  
  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join('\n');
  
  const _hash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');
  
  return _hash === hash;
};

module.exports = async (req, res, next) => {
  // For development without real bot token/data
  if (process.env.SKIP_AUTH === 'true') {
     req.user = { id: 12345, first_name: 'TestUser', username: 'testuser' };
     return next();
  }

  const initData = req.headers.authorization;
  if (!initData) return res.status(401).json({ error: 'No authorization data' });

  try {
    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get('user'));
    
    if (!user) return res.status(401).json({ error: 'No user data' });
    
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Auth failed' });
  }
};