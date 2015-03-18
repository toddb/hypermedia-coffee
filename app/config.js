var path = require('path')
    , compression = require('compression')
    , bodyparser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , session = require('express-session')
    , logger = require('morgan')
    , serveStatic = require('serve-static')
    , errorHandler = require('errorhandler');

module.exports = function (app, express, mongoose, middleware, port, env) {
  'use strict';

  var MongoStore = require('connect-mongo')(session);

  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.disable('x-powered-by')
  app.use(serveStatic(path.join(__dirname, '..', 'public', 'templates', 'partials')));
  app.use(bodyparser.json());
  app.use(compression());
  app.use(cookieParser());
  app.use(session({
    secret: 'shouldbeinc0nf1g',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  }));
  app.use(middleware.requestedUrl(port));
  app.use(middleware.auth.passport.initialize());
  app.use(middleware.auth.passport.session());
  app.use(middleware.etag());
  app.use(middleware.allowCrossDomain());
//    app.use(middleware.allowCrossDomain({ origin: "http://localhost:9876"})); // TODO: in config
  app.use(serveStatic(path.join(__dirname, '..', 'public')));

  if ('test' == env) {
    app.use(logger('combined'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    app.locals.data_main = "js/main";
  }

  if ('development' == env) {
    app.use(logger('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    app.locals.data_main = "js/main";
  }
  if ('production' == env) {
    app.use(errorHandler('tiny'));
    app.locals.data_main = "dist/main.built";
  }

  return this;
};
