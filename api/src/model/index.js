'use strict';

/**
 * @module model
 * @type {{Account: exports, Order: exports, Pay: exports}}
 */
module.exports = {
  Account: require('./account'),
  Order: require('./order'),
  Pay: require('./pay')
};