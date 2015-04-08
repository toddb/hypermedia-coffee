'use strict';

/**
 * Module dependencies.
 */
var config = require('./index'),
    log = require('./logger'),
    chalk = require('chalk'),
    path = require('path'),
    glob = require('glob'),
    mongoose = require('mongoose');

mongoose.connection.on('error', log.error.bind(log, 'connection error:'));

module.exports.loadModels = function () {
  glob("**/*Schema.js", function (err, modelPath) {
    modelPath.forEach(function (model) {
      log.debug("Loading model: " + model)
      require(path.resolve(model));
    })
  });
};

module.exports.loadPlugins = function () {
  glob("**/*Plugin.js", function (err, modelPath) {
    modelPath.forEach(function (plugin) {
      log.debug("Loading plugin: " + plugin)
      require(path.resolve(plugin));
    })
  });
};

module.exports.connect = function (cb) {
  var _this = this;
  var db = mongoose.connect(config.db, function (err) {
    if (err) {
      log.error(chalk.red('Could not connect to MongoDB! ' + config.db));
      log.error(err);
    } else {
      //_this.loadModels();
      //_this.loadPlugins();
      if (cb) cb(db);
    }
  });
  mongoose.connection.on('open', function () {
    log.info(chalk.green('Connected ' + config.db));
  });
};

module.exports.connection = mongoose.connection;

module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    log.info(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};