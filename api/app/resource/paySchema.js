'use strict';

var mongoose = require('mongoose'),
    ObjectId = require('mongoose').Schema.Types.ObjectId,
    timestamp = require('./plugin/timestamp'),
    resourceSchema = require('./resourcePlugin');

var schema = new mongoose.Schema({
  order: {type: ObjectId, required: true},
  created_on: {type: Date, default: Date.now},
  token: String
});

schema.plugin(resourceSchema);
schema.plugin(timestamp);

schema.pre('save', function (next) {
  if (this.isNew) {

    var Order = require('./index').Order;
    Order.findById(this.order, function (err, doc) {
      if (err) next(err);
      if (!doc) next(new Error("Order " + this.order + " not found"))

      doc.pay(function (err) {
        if (err) next(err);
        doc.save(function (err, doc) {
          if (err) next(err);
        })
      });
    })
  }
  next();
});

module.exports = schema;