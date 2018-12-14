let _ = require('lodash');
let defaultConfig = require('./default.conf.js');
let envConfig = process.env.BITMARK_CONFIGURATION ? require(process.env.BITMARK_CONFIGURATION) : require('./local.conf.json');
let config = _.merge(defaultConfig, envConfig);

const verifyConfig = (obj) => {
  let keys = Object.keys(config);
  keys.forEach((key) => {
    if (obj[key] instanceof Object) {
      verifyConfig(obj[key]);
    } else {
      if (config[key] === config.CONFIGURATION_REQUIRED && key !== 'CONFIGURATION_REQUIRED') {
        throw new Error(`Configuration for key "${key}" is missing`);
      }
    }
  });
};

if (!config.CONFIGURATION_REQUIRED) {
  throw new Error('Configuration for key CONFIGURATION_REQUIRED is missing');
} else {
  verifyConfig(config);
}

module.exports = config;
