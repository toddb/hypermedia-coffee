var path = require('path');

module.exports = function (app, express, mongoose, middleware, port) {
  'use strict';

  var MongoStore = require('connect-mongo')(express);

  app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'hbs');
    app.disable('x-powered-by')
    app.use(express.static(path.join(__dirname, '..', 'public', 'templates', 'partials')));
    app.use(express.bodyParser());
    app.use(express.compress());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: 'shouldbeinc0nf1g',
      store: new MongoStore({
        db: mongoose.connection.db
      })
    }));
    app.use(middleware.requestedUrl(port));
    app.use(middleware.auth.passport.initialize());
    app.use(middleware.auth.passport.session());
    app.use(middleware.etag());
    app.use(middleware.allowCrossDomain());
//    app.use(middleware.allowCrossDomain({ origin: "http://localhost:9876"})); // TODO: in config
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '..', 'public')));
  });

  app.configure('test', function () {
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.locals.data_main = "js/main";
  });

  app.configure('development', function () {
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.locals.data_main = "js/main";
  });

  app.configure('production', function () {
    app.use(express.errorHandler());
    app.locals.data_main = "dist/main.built";
  });

  return this;
};
