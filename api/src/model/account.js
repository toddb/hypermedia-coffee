'use strict';

/**
 * @module model
 * @type {mongoose.model|exports}
 */

var mongoose = require('mongoose'),
    accountSchema = require('./schema/account');


/**
 *  Account model
 */
module.exports = mongoose.model('account', accountSchema);
