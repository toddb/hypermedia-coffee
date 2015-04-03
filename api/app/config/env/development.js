'use strict';

module.exports = {
  db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/development',
  port: process.env.PORT || 8888,
  sessionSecret: '1sinc0nf1g',
  info: true,
  testuser: {
    name: 'bob',
    email: 'bob@somewhere.com',
    password: 'secret'
  }
};