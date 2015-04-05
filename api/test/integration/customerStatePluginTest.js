/*jslint node: true */
'use strict';

var should = require('should')
    , _ = require('underscore')
    , mongoose = require('mongoose')
    , coffeeState = require('../../app/resource/plugin/coffeeState')
    , schema = new mongoose.Schema()
    , acct = {type: 'small'}
    , id, order;

schema.plugin(coffeeState);

var Model = mongoose.model('coffeeState', schema);

var transitions = {
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
};

module.exports = {
  beforeEach: function () {
    order = new Model();
  },
  'Plugin: Customer State Plugin': {
    'state transition methods': _.reduce(transitions, function (tests, state, transition) {
      tests[transition] = function () {
        order[transition].should.be.a.Function
      }
      return tests;
    }, {}),
    'default state is order placed': function () {
      order.state.should.eql('start');
    }
  },
  'transitions (to, from)': _.reduce(transitions, function (tests, state, transition) {
    tests[transition] = function (done) {
      order.state = state.from;
      order[transition](function (err) {
        order.state.should.eql(state.to);
        done(err);
      })
    }
    return tests;
  }, {}),
  'Errors': {
    'Transition not allowed': function (done) {
      order.state = 'orderPlaced';
      order.pickup(function (err) {
        err.should.not.be.null
        done()
      });
    }
  }
};