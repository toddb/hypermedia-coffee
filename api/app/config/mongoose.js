'use strict';

/**
 * Module dependencies.
 */
var config = require('./index'),
    chalk = require('chalk'),
    path = require('path'),
    glob = require('glob'),
    mongoose = require('mongoose');

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

module.exports.loadModels = function () {
  glob("**/*Schema.js", function (err, modelPath) {
    modelPath.forEach(function (model) {
      console.log("Loading model: " + model)
      require(path.resolve(model));
    })
  });
};


module.exports.loadPlugins = function () {
  glob("**/*Plugin.js", function (err, modelPath) {
    modelPath.forEach(function (plugin) {
      console.log("Loading plugin: " + plugin)
      require(path.resolve(plugin));
    })
  });
};

module.exports.connect = function (cb) {
  var _this = this;
  var db = mongoose.connect(config.db, function (err) {
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB! ' + config.db));
      console.log(err);
    } else {
      //_this.loadModels();
      //_this.loadPlugins();
      if (cb) cb(db);
    }
  });
  mongoose.connection.on('open', function () {
    console.info(chalk.green('Connected ' + config.db));
  });
};

module.exports.connection = mongoose.connection;

module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};