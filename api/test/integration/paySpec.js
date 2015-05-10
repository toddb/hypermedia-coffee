/*jslint node: true */
'use strict';

var Payment = require('../../src/model/pay'),
    Order = require('../../src/model/order'),
    OrderItem = require('../../src/model/orderItem'),
    expect = require('chai').expect,
    _ = require('underscore');

var isAnId = /^[a-f0-9]{24}$/;

describe('Payment', function () {

  var orderId, paymentId;

  before(function (done) {
    Payment.remove({}, function (err, doc) {
      done(err);
    });
  });

  before(function (done) {
    Order.post({}, function (err, id) {
      orderId = id.toString();
      expect(orderId).to.match(isAnId);

      done();

    })
  });


  it('should have an order with state `start` and no payments', function (done) {
    Order.getItem(orderId, function (err, doc) {

      expect(err).to.be.null;
      expect(doc).to.be.not.null;

      var payments = doc._payments;
      expect(payments).to.be.empty;

      expect(doc.state).to.eql('start');
      done();
    })
  });

  describe('With orderItem', function () {


    before(function (done) {
      OrderItem.post({_parent: orderId, type: 'med'}, function (err, id) {
        expect(err).to.be.null;
        expect(id).to.be.not.null;

        done();
      })
    })


    it('should have an order with state `orderPlaced`', function (done) {
      Order.getItem(orderId, function (err, doc) {

        expect(err).to.be.null;
        expect(doc).to.be.not.null;

        var payments = doc._payments;
        expect(payments).to.be.empty;

        expect(doc.state).to.eql('orderPlaced');
        done();
      })

    });

    describe('it should add a payment for order', function () {

      before(function (done) {
        Payment.post({_parent: orderId, token: 'sasfdfsdfdd'}, function (err, id) {
          expect(err).to.be.null;
          paymentId = id;
          expect(paymentId).to.match(isAnId);
          done();
        });
      });

      it('find a payment for order', function (done) {
        Payment.getItemByParent(paymentId, orderId, function (err, doc) {
          expect(err).to.be.null;
          expect(doc).to.be.not.null;
          done();
        })
      });

      it('should find the payments on the order', function (done) {
        Order.getItem(orderId, function (err, doc) {

          expect(err).to.be.null;
          expect(doc).to.be.not.null;
          expect(doc.state).to.eql('paid');
          expect(doc._payments).to.be.not.empty;
          expect(doc._payments).to.contain(paymentId);
          done();
        })
      });

    });

  });
});

