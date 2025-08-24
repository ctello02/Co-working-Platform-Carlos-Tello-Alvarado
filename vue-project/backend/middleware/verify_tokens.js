const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  //   let token = req.headers['x-access-token'] || req.headers['authorization'];
  //   let checkBearer = 'Bearer ';

  //   if (token) {
  //     if (token.startsWith(checkBearer)) {
  //       token = token.slice(checkBearer.length, token.length);
  //     }

  //     jwt.verify(token, process.env.SECRET, (err, decoded) => {
  //       if (err) {
  //         res.json({
  //           success: false,
  //           message: 'Failed to authenticate',
  //         });
  //       } else {
  //         req.decoded = decoded;
  //         next();
  //       }
  //     });
  //   } else {
  //     res.json({
  //       success: false,
  //       message: 'No token Provided',
  //     });
  //   }

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
