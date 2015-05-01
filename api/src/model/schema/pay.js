'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    ObjectId = require('mongoose').Schema.Types.ObjectId,
    timestamp = require('./plugin/timestamp'),
    resourceSchema = require('./plugin/resource');

var log = require('../../config/logger');

var schema = new mongoose.Schema({
  order: {type: ObjectId, required: true},
  created_on: {type: Date, default: Date.now},
  token: String
});

schema.plugin(resourceSchema);
schema.plugin(timestamp);

schema.pre('save', function (next) {

  if (this.isNew) {


    //var Order = require('./').Order;
    //Order.findById(this.order, function (err, doc) {
    //
    //  console.log(err, doc )
    //
    //  if (err) {
    //    next(err);
    //  }
    //
    //  if (!doc) {
    //    next(new Error("Order " + this.order + " not found"));
    //  }
    //
    //  doc.pay(function (err) {
    //    if (err) next(err);
    //    doc.save(function (err, doc) {
    //      if (err) next(err);
    //    })
    //  });
    //})
  }

  next();
});

/**
 * Pay schema
 */
module.exports = schema;
