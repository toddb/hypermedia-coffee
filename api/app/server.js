'use strict';

var path = require('path'),
    chalk = require('chalk'),
    express = require('express'),
    config = require('./config/'),
    mongoose = require('./config/mongoose'),
    passport = require('passport'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    compression = require('compression'),
    bodyparser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    serveStatic = require('serve-static'),
    errorHandler = require('errorhandler');

var app = express();

app.set('allow-origin', 'http://localhost:63344');
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

  mongoose.connection.once('open', function callback() {

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

}

var middleware = require('./middleware/')(app),
    strategies = require('./strategy/passport')(app, passport),
    routes = require('./routes')(app);

mongoose.connect(function () {
  app.listen(config.port);
  console.log('Express server listening on port %d in %s mode', config.port, app.settings.env);
});


// for use with supertest - see http://stackoverflow.com/questions/11927196/supertest-custom-express-server-in-node
module.exports = app;