'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    resourceSchema = require('./plugin/resource'),
    timestamp = require('./plugin/timestamp');

var log = require('../../config/logger');

var schema = new mongoose.Schema({
  _parent: {type: mongoose.Schema.Types.ObjectId, ref: 'order'},
  type: {type: String, required: true},
  cost: {type: Number},
  description: {type: String}
});

schema.plugin(resourceSchema);
schema.plugin(timestamp);

schema.pre('save', function (next) {
  log.debug('Saving order item');
  var self = this;
  var Order = require('../order');
  Order.findById(this._parent, function (err, doc) {
    doc._items.push(self);                            // TODO: only works for new
    doc.save(function(err, doc, numAffected){
      next();
    });
  });

});

/**
 * Order model
 */
module.exports = schema;
