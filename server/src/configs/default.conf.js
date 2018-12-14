let CONFIGURATION_REQUIRED = 'configuration_required';

module.exports = {
  CONFIGURATION_REQUIRED: CONFIGURATION_REQUIRED,
  port: 1102,
  ip: '127.0.0.1',

  logger: {
    tagName: '',
    host: '',
    port: '',
    level: 'debug', // default : debug
    timeout: 3, // default : 3s
    console: true, // show in console or not, default : true
  },
  database: {
    host: CONFIGURATION_REQUIRED,
    port: CONFIGURATION_REQUIRED,
    user: CONFIGURATION_REQUIRED,
    password: CONFIGURATION_REQUIRED,
    database: CONFIGURATION_REQUIRED,
  },
  redis: {
    host: CONFIGURATION_REQUIRED,
    port: CONFIGURATION_REQUIRED,
  },
  saved_file_folder: CONFIGURATION_REQUIRED,

  map_identities: CONFIGURATION_REQUIRED,
  bitmarkSDK: {
    apiToken: CONFIGURATION_REQUIRED,
    network: CONFIGURATION_REQUIRED
  },
  api_server: CONFIGURATION_REQUIRED,
  profile_server: CONFIGURATION_REQUIRED,
  registry_server:CONFIGURATION_REQUIRED,

};
