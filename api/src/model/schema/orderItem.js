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

schema.pre('remove', function (next) {

  log.debug("Removing child from parent: orderItem to order")
  var self = this;

  var Order = require('../order');

  Order.findById(self._parent, function (err, orderDoc) {

    // only update if the child exists
    var indexOf = orderDoc._items.indexOf(self._id);
    if (indexOf > -1) {
      orderDoc._items.splice(indexOf, 1);
      orderDoc.save(function (err, doc, numAffected) {
        if (err) {
          next(err);
        }
        next();
      });
    } else {
      next();
    }
  });

});

schema.pre('save', function (next) {

  log.debug("Adding child to parent: orderItem to order")

  var self = this;
  var Order = require('../order');

  Order.findById(this._parent, function (err, doc) {

    // only update the parent if the child is new
    if (doc._items.indexOf(self._id) == -1) {  // underscore contains isn't working ??
      doc._items.push(self);
      doc.save(function (err, doc, numAffected) {
        if (err) {
          next(err);
        }
        next();
      });
    } else {
      next();

    }
  });

});

/**
 * Order model
 */
module.exports = schema;
