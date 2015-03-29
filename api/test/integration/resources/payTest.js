/*jslint node: true */
'use strict';

var should = require('should')
    , Resource = require('../../../app/resource').Pay
    , Order = require('../../../app/resource').Order
    , id
    , orderId;

module.exports = {
  'resource: Pay': {
    before: function (done) {
      Order.create({type: 'medium'}, function (err, doc) {
        if (err) return done(err);
        orderId = doc.id;
        done()
      })
    },
    beforeEach: function (done) {
      Resource.remove({}, function (err, doc) {
        Resource.post({order: orderId, token: 'sasfdfsdfdd'}, function (err, _id_) {
          id = _id_;
          done();
        });
      });
    },
    'collection': {
      'POST': function () {
        id.should.not.be.null;
      },
      'GET': function (done) {
        Resource.get('/pay/', function (err, doc) {
          var o = doc.toJSON();
          o.links.length.should.equal(4);
          done();
        });
      }
    },
    'item': {
      'GET - with id returns item resource': function (done) {
        Resource.get(id, '/pay/', function (err, doc) {
          doc.should.be.a.object
          var o = doc.toJSON();
          o.links.length.should.equal(1);
          o.order.toString().should.eql(orderId);
          done();
        });
      },
      'PUT - full update with returning doc': function (done) {
        Resource.put(id, {token: 'xxxyf675fjhg'}, function (err, doc) {
          var o = doc.toObject();
          should.not.exist(err);
          o.__v.should.equal(1);
          o.token.should.equal('xxxyf675fjhg');
          done();
        });
      },
      'DELETE - returns deleted doc': function (done) {
        Resource.delete(id, function (err, doc) {
          should.not.exist(err);
          should.exist(doc);
          done();
        });
      }
    }
  }
};