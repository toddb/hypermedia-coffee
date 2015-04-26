var statemachine = require('./statemachine.js');

/**
 * Adds coffee states to the statemachine (to the model as a schema plugin)
 *
 *    states: {
 *         start: { default: true},
 *         orderPlaced: { },
 *         paid: {},
 *         drinkReceived: {}
 *       },
 *    transitions: {
 *         placeOrder: {
 *           from: 'start',
 *           to: 'orderPlaced'
 *         },
 *         pay: {
 *           from: 'orderPlaced',
 *           to: 'paid'
 *         },
 *         pickup: {
 *           from: 'paid',
 *           to: 'drinkReceived'
 *         }
 *       }
 *
 *
 * @example
 *  var mongoose = require('mongoose'),
 *  coffeeState = require('./plugin/coffeeState'),
 *
 *  var schema = new mongoose.Schema({
 *   type: {type: String, required: true}
 * });
 *
 *  schema.plugin(coffeeState);
 *
 *
 * @type {Function}
 * @param {mongoose.Schema} schema
 * @param {*} options
 * @exports
 */
module.exports = exports = function coffeeState(schema, options) {

  var opts = {
    states: {
      start: { default: true},
      orderPlaced: { },
      paid: {},
      drinkReceived: {}
    },
    transitions: {
      placeOrder: {
        from: 'start',
        to: 'orderPlaced'
      },
      pay: {
        from: 'orderPlaced',
        to: 'paid'
      },
      pickup: {
        from: 'paid',
        to: 'drinkReceived'
      }
    }
  }

  schema.plugin(statemachine, opts);
}