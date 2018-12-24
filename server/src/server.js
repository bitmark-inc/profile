const http = require('http');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { config } = global.appContext;

const router = require('./routers');
const ejs = require('ejs');
ejs.delimiter = '@';

class Server {
  constructor() {
    this.app = express();
    this.app.engine('html', ejs.renderFile);
    this.app.set('views', path.join(__dirname, './../views'));
    this.app.set('view engine', 'html');
    this.app.enable('trust proxy', 'loopback');
    this.app.use(compression());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(methodOverride());

    this.app.disable('x-powered-by');
    this.app.use(morgan('dev'));
    this.app.use('', router);

    this.app.use((req, res) => {
      res.status(404);
      res.send({ message: 'Page not found!' });
    });
  }

  run() {
    this.server = http.createServer(this.app);
    this.server.listen(config.port);
  }
  close() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = Server;