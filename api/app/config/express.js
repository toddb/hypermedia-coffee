var config = require('./index'),
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

module.exports.init = function (db) {

  var app = express();

  app.set('port', config.port);

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

  app.use('/login', serveStatic('public'));

  if ('production' != app.settings.env) {
    app.use(logger('combined'));
    app.use(errorHandler({dumpExceptions: true, showStack: true}));

    require('mongoose').connection.once('open', function callback() {

      // Fake account for now
      var Account = require('../resource').Account;
      Account.create({
        username: config.testuser.name,
        email: config.testuser.email,
        password: config.testuser.password
      }, function (err, doc) {
        if (err) {
          if (err.code == 11000) {
            console.log('Account: ' + config.testuser.name + ' exists.\n');
          } else {
            console.log(err);
          }
        } else {
          console.log('Account: ' + doc.username + " saved.\n");
        }
      });
      console.log();
    })

  }

  var middleware = require('../middleware/')(app),
      strategies = require('../strategy/passport')(app, passport),
      routes = require('../routes')(app);

  return app;
}