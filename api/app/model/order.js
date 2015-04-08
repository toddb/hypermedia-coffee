'use strict';

var mongoose = require('mongoose'),
    resourceSchema = require('./plugin/resource'),
    coffeeState = require('./plugin/coffeeState'),
    timestamp = require('./plugin/timestamp'),
    versioner = require('mongoose-versioner');

var schema = new mongoose.Schema({
  type: {type: String, required: true}
});

schema.plugin(resourceSchema);
schema.plugin(coffeeState);
schema.plugin(timestamp);
schema.plugin(versioner, {modelName: 'order', mongoose: mongoose});


schema.pre('save', function (next) {
  if (this.isNew) {
    this.placeOrder(function (err) {
      if (err) next(err);
    })
  }
  next();
});

module.exports = mongoose.model('order', schema);
