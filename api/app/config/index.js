'use strict';

module.exports = {
  db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test',
  port: process.env.PORT || 8888,
  app: {
    title: 'Coffee Sample api',
    description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport'
  },

  sessionSecret: 'sect87key'
};