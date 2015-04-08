/*jslint node: true */
'use strict';

var should = require('should')
    , Resource = require('../../app/model/index').Pay
    , Order = require('../../app/model/index').Order
    , id
    , orderId;

module.exports = {
  'resource: Pay': {
    before: function (done) {
      Order.create({type: 'medium'}, function (err, doc) {
        orderId = doc.id;
        done(err)
      })
    },
    beforeEach: function (done) {
      Resource.remove({}, function (err, doc) {
        Resource.post({order: orderId, token: 'sasfdfsdfdd'}, function (err, _id_) {
          id = _id_;
          done(err);
        });
      });
    },
    'collection': {
      'POST': function () {
        id.should.not.be.null;
      },
      'GET': function (done) {
        Resource.getCollection(function(err, doc){
          done(err);
        });
      }
    },
    'item': {
      'GET - with id returns item resource': function (done) {
        Resource.getItem(id, function (err, doc) {
          doc.order.toString().should.eql(orderId);
          done(err);
        });
      },
      'PUT - full update with returning doc': function (done) {
        Resource.put(id, {token: 'xxxyf675fjhg'}, function (err, doc) {
          doc.__v.should.equal(1);
          doc.token.should.equal('xxxyf675fjhg');
          done(err);
        });
      },
      'DELETE - returns deleted doc': function (done) {
        Resource.delete(id, function (err, doc) {
          should.exist(doc);
          done(err);
        });
      }
    }
  }
};