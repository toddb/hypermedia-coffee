'use strict';

/**
 *
 * @type {{port: (number), app: {title: string, description: string, keywords: string}, info: boolean, sessionSecret: string}}
 */
module.exports = {
  port: process.env.PORT || 8888,
  app: {
    title: 'Coffee Sample api',
    description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport'
  },
  info: false,
  sessionSecret: 'sect87key'
};