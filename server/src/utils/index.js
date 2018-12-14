const bitmarkSDK = require('bitmark-sdk');
const nacl = require('tweetnacl-nodewrap');

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


module.exports = {
  responseError, newError,
  verifySignature,
};