const bitmarkSDK = require('bitmark-sdk');
const nacl = require('tweetnacl-nodewrap');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const { config } = global.appContext;
let certJWT = fs.readFileSync(config.public_key_file);

const responseError = (response, error) => {
  let status = 500;
  let message = 'Server error!';
  if (error.httpStatusCode) {
    status = error.httpStatusCode;
    message = error.message;
  }
  response.status(status);
  response.send({ error: message });
};

const newError = (message, httpStatusCode, errorCode) => {
  let error = new Error(message);
  error.httpStatusCode = httpStatusCode;
  error.errorCode = errorCode;
  return error;
};


const verifySignature = (messageString, signatureHex, bitmarkAccountNumber) => {
  try {
    let accountInfo = bitmarkSDK.Account.parseAccountNumber(bitmarkAccountNumber);
    let publicKeyBuffer = accountInfo.pubKey;
    let messageBuffer = Buffer.from(messageString);
    let signatureBuffer = Buffer.from(signatureHex, 'hex');
    let result = nacl.sign.detached.verify(messageBuffer, signatureBuffer, publicKeyBuffer);
    return !!result;
  } catch (error) {
    console.log('verify signature error :', error);
    return false;
  }
};

const validateJWT = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, certJWT, {
      algorithms: ['RS256'],
    }, (error, decoded) => {
      if (error) {
        return resolve();
      }
      // token should be issued before current time and expired after current time.
      // time in token is second
      if (decoded && (decoded.iat * 1000) < Date.now() && (decoded.exp * 1000) > Date.now()) {
        resolve(decoded);
      } else {
        resolve();
      }
    });
  });
};


module.exports = {
  responseError, newError,
  verifySignature,
  validateJWT,
};