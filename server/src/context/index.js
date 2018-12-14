const bitmarkSDK = require('bitmark-sdk');

const config = require('./../configs');

bitmarkSDK.init(config.bitmarkSDK);

const logUtil = require('./log-util');
logUtil.initialize(config.logger);
const logger = logUtil.getLogger();

const dbUtil = require('./db-util');
dbUtil.initialize(config.database);


const appContext = {
  config,
  logger,
  dbUtil,
};

module.exports = appContext;
