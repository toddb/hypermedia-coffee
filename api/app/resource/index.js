'use strict';

var mongoose = require('mongoose');

function model(name) {
  return mongoose.model(name, require('./' + name + 'Schema'));
}

module.exports = {
  Account: model('account'),
  Order: model('order'),
  Pay: model('pay')
};