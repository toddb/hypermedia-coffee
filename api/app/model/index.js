'use strict';

var mongoose = require('mongoose');

module.exports = {
  Account: mongoose.model('account', require('./accountSchema')),
  Order: mongoose.model('order', require('./orderSchema')),
  Pay: mongoose.model('pay', require('./paySchema'))
};