'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    timestamp = require('./plugin/timestamp'),
    resourceSchema = require('./plugin/resource');

var log = require('../../config/logger');

var schema = new mongoose.Schema({
  _parent: {type: ObjectId, required: true},
  token: String
});

schema.plugin(resourceSchema);
schema.plugin(timestamp);

schema.pre('save', function (next) {

  if (this.isNew) {

    var Order = require('../order');
    Order.addPayment(this._parent, this._id, next);

  } else {
    next();
  }
});

/**
 * Pay schema
 */
module.exports = schema;
