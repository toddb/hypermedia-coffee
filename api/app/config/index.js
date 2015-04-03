'use strict';

var _ = require('lodash'),
    chalk = require('chalk'),
    glob = require('glob'),
    path = require('path');

/**
 * Validate NODE_ENV existance
 */
var validate = function () {
  console.log();
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
  }

  // Reset console color
  console.log(chalk.white(''));
};

var initialise = function () {

  validate();

  var defaultConfig = require('./env/default');
  var environmentConfig = require('./env/' + process.env.NODE_ENV) || {};
  var config = _.extend(defaultConfig, environmentConfig);

  if (config.info) {
    console.log(config);
    console.log();
  }
  return config;
}

module.exports = initialise()