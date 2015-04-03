'use strict';

var config = require('./config/'),
    express = require('./config/express'),
    mongoose = require('./config/mongoose');

var app;

mongoose.connect(function (db) {

  app = express.init(db)
  app.listen(config.port);
  console.log('Coffee API listening on port %d in %s mode', config.port, app.settings.env);

});