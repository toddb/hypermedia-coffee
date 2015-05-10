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
    versioner = require('mongoose-versioner'),
    _ = require('underscore');

var log = require('../../config/logger');

var schema = new mongoose.Schema({
  _items: [{type: mongoose.Schema.Types.ObjectId, ref: 'orderItem'}],
  _payments: [{type: mongoose.Schema.Types.ObjectId, ref: 'pay'}]
});

schema.plugin(resourceSchema);
schema.plugin(coffeeState);
schema.plugin(timestamp);
//schema.plugin(versioner, {modelName: 'order', mongoose: mongoose});

schema.statics.updateOrderItem = function (id, itemId, cb) {

  this.findById(id, function (err, doc) {

    // only update the parent if the child is new
    if (doc._items.indexOf(itemId) == -1) {

      log.debug("Adding item to order: " + itemId);
      doc._items.push(itemId);
      // KLUDGE: there is something funky creating a duplicate - so let's clean up
      doc._items = _.unique(doc._items);

      doc.placeOrder(function (err) {
        if (err) {
          log.warn(err + ' on id: ' + doc._id + ' - current state is: ' + doc.state);
        }
      })

      doc.save(function (err, doc, numAffected) {
        cb(err);
      });

    }

    cb();

  });
};

schema.statics.removeOrderItem = function (id, itemId, cb) {

  this.findById(id, function (err, doc) {

    // only update if the child exists
    var indexOf = doc._items.indexOf(itemId);
    if (indexOf > -1) {
      doc._items.splice(indexOf, 1);
      doc.save(function (err, doc, numAffected) {
         if (err) {
          log.warn(err)
        }
        log.debug("Removed item from order: " + itemId);
        cb();
      });
    } else {
      cb();
    }

  });
};

schema.statics.addPayment = function (id, paymentId, cb) {

  this.findById(id, function (err, doc) {

    if (err) {
      return cb(err);
    }

    if (!doc) {
      return cb(new Error("Order " + id + " not found"));
    }

    doc.pay(function (err) {

      if (err) {
        log.warn(err + ' on id: ' + doc._id + ' - current state is: ' + doc.state);
      };

      doc._payments.push(paymentId);

      doc.save(function (err, doc) {
        if (err) {
          log.warn(err)
        }
        log.debug("Added payment to order: " + paymentId);
        cb(err);
      })
    });
  })
};

/**
 * Order model
 */
module.exports = schema;
