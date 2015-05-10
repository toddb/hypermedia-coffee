'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    resourceSchema = require('./plugin/resource'),
    timestamp = require('./plugin/timestamp'),
    _ = require('underscore');

var log = require('../../config/logger');

var schema = new mongoose.Schema({
  _parent: {type: mongoose.Schema.Types.ObjectId, ref: 'order'},
  type: {type: String, required: true},
  cost: {type: Number},
  description: {type: String}
});

schema.plugin(resourceSchema);
schema.plugin(timestamp);

schema.blacklist = ['_parent'];

schema.pre('remove', function (next) {

  var Order = require('../order');
  Order.removeOrderItem(this._parent, this._id, next)

});


schema.pre('save', function (next) {

  var Order = require('../order');
  Order.updateOrderItem(this._parent, this._id, next);

});

/**
 * Order model
 */
module.exports = schema;
