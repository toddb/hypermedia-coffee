'use strict';

var _ = require('lodash'),
    chalk = require('chalk'),
    glob = require('glob'),
    path = require('path');

/**
 * Validate NODE_ENV existance
 */
var validate = function() {
  var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
  console.log();
  if (!environmentFiles.length) {
    if (process.env.NODE_ENV) {
      console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
    } else {
      console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
    }
    process.env.NODE_ENV = 'development';
  } else {
    console.log(chalk.bold('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
  }
  // Reset console color
  console.log(chalk.white(''));
};

var initialise = function(){

  validate();

  var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));
  var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};
  var config = _.extend(defaultConfig, environmentConfig);

  if (config.info){
    console.log(config);
    console.log();
  }
  return config;
}

module.exports = initialise()