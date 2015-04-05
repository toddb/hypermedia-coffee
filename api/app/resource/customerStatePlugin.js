var statemachine = require('../util/statemachine.js');

module.exports = exports = function customerStatePlugin(schema, options) {

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