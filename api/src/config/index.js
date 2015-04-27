'use strict';

var _ = require('lodash'),
    log = require('./logger'),
    glob = require('glob'),
    path = require('path');

/**
 * Validate NODE_ENV existence and set to `development` as default
 */
var validate = function () {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    log.warn('NODE_ENV is not defined! Using default development environment');
  }
};

/**
 * Loads the environment config extended on the default set
 * @returns {{port: (number), app: {title: string, description: string, keywords: string}, info: boolean, sessionSecret: string}}
 */
var initialise = function () {

  validate();

  var defaultConfig = require('./env/default');
  var environmentConfig = require('./env/' + process.env.NODE_ENV) || {};
  var config = _.extend(defaultConfig, environmentConfig);
  log.debug(config);
  return config;
}

/**
 * Initialise the configuration based on the environment from process.env.NODE_ENV
 *
 * @example
 * {
 *  port: process.env.PORT || 8888,
 *  app: {
 *    title: 'Coffee Sample api',
 *    description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
 *    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport'
 *  },
 *  info: false,
 *  sessionSecret: 'sect87key'
 * }
 * @return {{port: (number), app: {title: string, description: string, keywords: string}, info: boolean, sessionSecret: string}}
 */
module.exports = initialise()