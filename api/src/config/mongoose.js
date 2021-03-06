'use strict';

/**
 * Module dependencies.
 */
var config = require('./index'),
    log = require('./logger'),
    path = require('path'),
    glob = require('glob'),
    mongoose = require('mongoose');

mongoose.connection.on('error', log.error.bind(log, 'connection error:'));

mongoose.set('debug', function (collectionName, method, query, doc, options ) {
  log.debug('mongo collection: %s method: %s', collectionName, method);
});

/**
 * @deprecated
 */
module.exports.loadModels = function () {
  glob("**/*Schema.js", function (err, modelPath) {
    modelPath.forEach(function (model) {
      log.debug("Loading model: " + model)
      require(path.resolve(model));
    })
  });
};

/**
 * @callback CallBack
 * @param {mongoose} db Instance of the mongoose database
 */

/**
 * Connect mongoose
 * @example
 *
 * mongoose.connect(function (db) {
 *  app = express.init(db)
 * });
 *
 * @param {CallBack} cb Callback
 */
module.exports.connect = function (cb) {
  var _this = this;
  var db = mongoose.connect(config.db, function (err) {
    if (err) {
      log.error('Could not connect to MongoDB! ' + config.db);
      log.error(err);
    } else {
      //_this.loadModels();
      if (cb) cb(db);
    }
  });
  mongoose.connection.on('open', function () {
    log.info('Connected ' + config.db);
  });
};

/**
 * @Returns {mongoose.connection}
 */
module.exports.connection = mongoose.connection;

/**
 * @callback CallBack
 * @param {Error} err
 */

/**
 * Disconnect mongoose
 * @param {CallBack} cb
 */
module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    log.info('Disconnected from MongoDB.');
    cb(err);
  });
};