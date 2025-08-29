const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const auth = req.get('authorization') || '';
  const x = req.get('x-access-token');
  let token = '';

  if (/^Bearer\s+/i.test(auth)) token = auth.replace(/^Bearer\s+/i, '').trim();
  else if (x) token = x.trim();

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'No token provided' });
  }

  try {
    const secret = process.env.SECRET;
    const decoded = jwt.verify(token, secret);
    req.decoded = decoded;
    return next();
  } catch (e) {
    return res
      .status(401)
      .json({ success: false, message: 'Failed to authenticate' });
  }
};
