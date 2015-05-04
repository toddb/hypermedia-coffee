'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
//itemSchema = require('./orderItem'),
    resourceSchema = require('./plugin/resource'),
    coffeeState = require('./plugin/coffeeState'),
    timestamp = require('./plugin/timestamp'),
    versioner = require('mongoose-versioner');

var schema = new mongoose.Schema({
  _items: [{type: mongoose.Schema.Types.ObjectId, ref: 'orderItem'}]
});

schema.plugin(resourceSchema);
schema.plugin(coffeeState);
schema.plugin(timestamp);
//schema.plugin(versioner, {modelName: 'order', mongoose: mongoose});


//schema.pre('save', function (next) {
//  if (this.isNew) {
//    this.placeOrder(function (err) {
//      if (err) next(err);
//    })
//  }
//  next();
//});

/**
 * Order model
 */
module.exports = schema;
