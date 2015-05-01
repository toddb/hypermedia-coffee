'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    paySchema = require('./schema/pay');

/**
 * Pay model
 */
module.exports = mongoose.model('pay', paySchema);
