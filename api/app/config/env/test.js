'use strict';

/**
 *
 * @type {{db: string, port: number, sessionSecret: string, testuser: {name: string, email: string, password: string}}}
 */
module.exports = {
  db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test',
  port: process.env.PORT || 62888 || Math.floor(Math.random() * 51439 + 7000),
  sessionSecret: 'sect87key1supp0se',
  testuser: {
    name: 'bob',
    email: 'bob@somewhere.com',
    password: 'secret'
  }
};