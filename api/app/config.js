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

  app.disable('x-powered-by')
  app.use(bodyparser.json({strict: false}));
  app.use(bodyparser.urlencoded({extended: true}));
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

  app.use('/login', serveStatic('public'));

  if ('test' == env) {
    app.use(logger('combined'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
  }

  if ('development' == env) {
    app.use(logger('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
  }
  if ('production' == env) {
    app.use(errorHandler('tiny'));
  }

  return this;
};
