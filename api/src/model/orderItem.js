'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    orderItemSchema = require('./schema/orderItem');

/**
 * Order model
 */
module.exports = mongoose.model('orderItem', orderItemSchema);
