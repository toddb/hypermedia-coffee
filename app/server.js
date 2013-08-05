'use strict';

var express = require('express')
  , app = module.exports = express()
  , mongoose = require('mongoose').connect('localhost', app.settings.env);

var port = process.env.PORT || 8888
  , middleware = require('./middleware')
  , config = require('./config')(app, express, mongoose, middleware, port)
  , routes = require('./routes')(app, middleware.auth)
  , server = app.listen(port, function () {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
      console.log("Using mongodb://%s:%s/%s", db.host, db.port, db.name);

      // Fake account for now
      var Account = require('./resource').Account;
      Account.create({ username: 'bob', email: 'bob@here.com', password: 'secret' }, function (err, doc) {
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

    });

  });

return server;