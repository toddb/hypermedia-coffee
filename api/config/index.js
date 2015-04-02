'use strict';

module.exports = {
  db: 'mongodb://localhost/test',
  port: process.env.PORT || 3000,
  app: {
    title: 'Coffee Sample api',
    description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport'
  },

  sessionSecret: 'sect87key'
};