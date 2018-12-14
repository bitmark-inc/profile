const winston = require('winston');
const fluentTransport = require('fluent-logger').support.winstonTransport();

let logger;

let logUtil = {};
logUtil.initialize = (options) => {
  if (logger) {
    return;
  }
  let loggerTransports = [
    new fluentTransport(options.tagName, { host: options.host, port: options.port, timeout: options.timeout }),
  ];
  if (options.console) {
    loggerTransports.push(new (winston.transports.Console)({
    }));
  }
  logger = winston.createLogger({
    level: options.level || 'debug',
    transports: loggerTransports,
  });
};

logUtil.getLogger = () => {
  if (!logger) {
    throw new Error('Need initialize first!');
  }
  return logger;
};

module.exports = logUtil;