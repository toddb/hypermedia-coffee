/*jslint node: true */
'use strict';

var Order = require('../../app/model/index').Order
  , should = require('should');

var id;

module.exports = {
  'resource: Order': {
    'collection': {
      'POST': function (done) {
        Order.remove({}, function (err, doc) {
        });
        Order.post({type: 'medium'}, function (err, id) {
          id.should.not.be.null;
          done(err);
        });
      },
      'GET': function (done) {
        Order.getCollection(function(err, doc){
          done(err);
        });
      }
    }
  }
};