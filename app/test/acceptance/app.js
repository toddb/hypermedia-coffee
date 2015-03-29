module.exports = function (port) {
  'use strict';

  // pick a new port above 7000

  process.env.PORT = port || Math.floor(Math.random() * 61439 + 7000);
  process.env.NODE_ENV = 'test';

  return require('../../server');
};