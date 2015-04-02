'use strict';

// TODO: see alternative loading mechanism in MEAN: https://github.com/meanjs/mean/blob/0.4.0/modules/articles/server/models/article.server.model.js
// this would be delegated into config/mongoose loadModules() such that it is registered in mongoose.model('Name')
var mongoose = require('mongoose');

function model(name) {
  return mongoose.model(name, require('./' + name + 'Schema'));
}

module.exports = {
  Account: model('account'),
  Order: model('order'),
  Pay: model('pay'),
  ResourcePlugin: require('./resourcePlugin')
};