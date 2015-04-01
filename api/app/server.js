'use strict';

var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    path = require('path'),
    compression = require('compression'),
    bodyparser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    serveStatic = require('serve-static'),
    errorHandler = require('errorhandler');

var app = express();

app.set('allow-origin', 'http://localhost:63344');
app.set('port', process.env.PORT || 8888);

app.set('mongodb_uri', process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/' + app.settings.env);
app.db = mongoose.connect(app.get('mongodb_uri'));

app.disable('x-powered-by')
app.use(bodyparser.json({strict: false}));
app.use(bodyparser.urlencoded({extended: true}));
app.use(compression());
app.use(cookieParser());
app.use(session({
  secret: 'shouldbeinc0nf1g',
  saveUninitialized: true,
  resave: true,
  store: new mongoStore({url: app.get('mongodb_uri')})
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/login', serveStatic('public'));

if ('test' == app.settings.env) {
  app.use(logger('combined'));
  app.use(errorHandler({dumpExceptions: true, showStack: true}));
}

if ('development' == app.settings.env) {
  app.use(logger('dev'));
  app.use(errorHandler({dumpExceptions: true, showStack: true}));
}
if ('production' == app.settings.env) {
  app.use(errorHandler('tiny'));
}

var middleware = require('./middleware/index')(app),
    strategies = require('./strategy/passport')(app, passport),
    routes = require('./routes')(app);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback() {
    console.log("Using mongodb://%s:%s/%s", db.host, db.port, db.name);

    // Fake account for now
    var Account = require('./resource').Account;
    Account.create({username: 'bob', email: 'bob@here.com', password: 'secret'}, function (err, doc) {
      if (err) {
        if (err.code == 11000) {
          console.log('Account: bob exists.');
        } else {
          console.log(err);
        }
      } else {
        console.log('Account: ' + doc.username + " saved.");
      }
    });

  })
});

// for use with supertest - see http://stackoverflow.com/questions/11927196/supertest-custom-express-server-in-node
module.exports = app;