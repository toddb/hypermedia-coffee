'use strict';

/**
 * Module dependencies.
 */
var config = require('./'),
    chalk = require('chalk'),
    path = require('path'),
    mongoose = require('mongoose');

module.exports.loadModels = function () {
  config.files.server.models.forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });
};

module.exports.connect = function (cb) {
  var _this = this;

  var db = mongoose.connect(config.db, function (err) {

    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    } else {
      //_this.loadModels();
      if (cb) cb(db);
    }
  });
  mongoose.connection.on('open', function(){
    console.info(chalk.green('Connected ' + config.db));
  });
};

module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};