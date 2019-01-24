const path = require('path');
(async () => {
  let appContext = require('./src/context');
  global.appContext = appContext;

  global.appContext.root = path.join(__dirname);

  let Server = require('./src/server');
  let server = new Server();
  server.run();

  process.on('unhandledRejection', (reason, p) => {
    appContext.logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });

  process.on('SIGTERM', () => {
    appContext.logger.info(`Bitmark profile server is terminating`);
    server.close(() => {
      process.exit(0);
    });
  });
})();
