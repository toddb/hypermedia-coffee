'use strict';

var _ = require('lodash'),
    log = require('./logger'),
    glob = require('glob'),
    path = require('path');

/**
 * Validate NODE_ENV existance
 */
var validate = function () {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    log.error('NODE_ENV is not defined! Using default development environment');
  }

};

var initialise = function () {

  validate();

  var defaultConfig = require('./env/default');
  var environmentConfig = require('./env/' + process.env.NODE_ENV) || {};
  var config = _.extend(defaultConfig, environmentConfig);
  log.debug(config);
  return config;
}

module.exports = initialise()