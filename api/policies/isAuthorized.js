const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;

module.exports = async function (req, res, next) {
  let token;
  const statusCodeToSet = 401;

  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(' ');

    if (parts.length === 2) {
      let scheme = parts[0];
      let credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.status(statusCodeToSet).send({
        message: 'Format is authorization: Bearer [token]',
      });
    }
  } else {
    return res.status(statusCodeToSet).send({
      message: 'No authorization header was found',
    });
  }

  const publicKeyPath = path.resolve(__dirname, '../../cert/public.pem');

  const publicKey = await fs
    .readFile(publicKeyPath)
    .catch(() => {
      return res.status(statusCodeToSet).send({
        message: 'Secret key is not found',
      });
    });

  jwt.verify(token, publicKey, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(statusCodeToSet).send({
        message: 'Invalid Token',
      });
    }

    req.user = decoded;
    next();
  });
};
