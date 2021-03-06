'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    orderSchema = require('./schema/order');

/**
 * Order model
 */
module.exports = mongoose.model('order', orderSchema);
