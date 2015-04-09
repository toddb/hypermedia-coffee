var config = require('./index'),
    log = require('./logger'),
    express = require('express'),
    passport = require('passport'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    compression = require('compression'),
    bodyparser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    serveStatic = require('serve-static'),
    errorHandler = require('errorhandler');

/**
 * Initialises the express instance with routes, middleware, logging and authentication strategies.
 * Current this approach uses session state to hold authentication (and is persisted in mongo)
 *
 * @param {mongoose} db Database instance
 * @returns {*|express|exports}
 */
module.exports.init = function (db) {

  var app = express();

  app.set('port', config.port);
  app.set('verbose', config.info);

  app.disable('x-powered-by')
  app.use(bodyparser.json({strict: false}));
  app.use(bodyparser.urlencoded({extended: true}));
  app.use(compression());
  app.use(cookieParser());
  app.use(session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: true,
    store: new mongoStore({url: config.db})
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(logger("combined", {"stream": log.stream}));

  /**
   * Exposes the logger to req, res cycles via req.app.log
   * @type {winston.Logger|exports}
   */
  app.log = log;

  /**
   * Exposes the mongoose db to req, res cycles via req.app.db.models
   * @type {winston.Logger|exports}
   */
  app.db = db;

  app.use('/login', serveStatic('public'));

  if ('production' != app.settings.env) {

    app.use(errorHandler({dumpExceptions: true, showStack: true}));

    db.connection.once('open', function callback() {

      // Fake account for now
      var Account = require('../model').Account;
      Account.create({
        username: config.testuser.name,
        email: config.testuser.email,
        password: config.testuser.password
      }, function (err, doc) {
        if (err) {
          if (err.code == 11000) {
            log.debug('Account: ' + config.testuser.name + ' exists.\n');
          } else {
            log.error(err);
          }
        } else {
          log.debug('Account: ' + doc.username + " saved.\n");
        }
      });
    });

  }

  var middleware = require('../middleware/')(app),
      strategies = require('../strategy/passport')(app, passport),
      routes = require('../routes')(app);

  return app;
}