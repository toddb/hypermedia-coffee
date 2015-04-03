'use strict';

module.exports = {
  db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test',
  port: process.env.PORT || Math.floor(Math.random() * 61439 + 7000),
  sessionSecret: 'sect87key1supp0se',
  testuser: {
    name: 'bob',
    email: 'bob@somewhere.com',
    password: 'secret'
  }
};