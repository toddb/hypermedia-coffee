/*jslint node: true */
'use strict';

var Order = require('../../src/model').Order,
    OrderItem = require('../../src/model/orderItem'),
    expect = require('chai').expect,
    _ = require('underscore');

var isAnId = /^[a-f0-9]{24}$/;

describe('Order', function () {

  var orderId;

  before(function (done) {
    Order.post({}, function (err, id) {
      orderId = id.toString();
      expect(orderId).to.match(isAnId);
      done();
    })
  });

  it('GET empty order', function (done) {
    Order.getItem(orderId, function (err, doc) {
      expect(err).to.be.null;
      expect(doc).to.be.not.null;
      expect(doc.items).to.be.empty;
      expect(doc.id).equal(orderId);
      done();
    })
  });

  describe('item collection', function () {

    var itemId, item;

    before(function (done) {

      OrderItem.post({_parent: orderId, type: 'med'}, function (err, id) {
        expect(err).to.be.null;
        expect(id).to.be.not.null;
        itemId = id.toString();
        expect(itemId).to.match(isAnId);

        OrderItem.getItem(itemId, function (err, doc) {
          expect(err).to.be.null;
          expect(doc).to.be.not.null;
          item = doc;
          done();
        })
      })
    });

    it('add single items', function (done) {

      Order.getItem(orderId, function (err, doc) {
        expect(err).to.be.null;
        expect(doc).to.be.not.null;
        expect(doc._items).to.contain(itemId);
        done();
      });

    });

    it('add multiple items', function (done) {

      OrderItem.post({_parent: orderId, type: 'large'}, function (err, id) {

        Order.getItem(orderId, function (err, doc) {

          expect(err).to.be.null;
          expect(doc).to.be.not.null;
          expect(doc._items).to.contain(itemId);
          expect(doc._items).to.contain(id);

          done();
        });
      });


    });

    it('update an item', function (done) {
      Order.getItem(orderId, function (err, doc) {

        expect(err).to.be.null;
        expect(doc).to.be.not.null;

        var initialItems = doc._items;
        expect(initialItems).to.be.not.empty;

        var item = _.first(initialItems);

        OrderItem.getItem(item, function (err, doc) {
          expect(err).to.be.null;
          expect(doc).to.be.not.null;
          doc.type = 'small';

          OrderItem.put(item, doc, function (err, doc) {

            expect(err).to.be.null;
            expect(doc).to.be.not.null;

            expect(doc.type).to.equal('small');

            Order.getItem(orderId, function (err, doc) {
              expect(err).to.be.null;
              expect(doc).to.be.not.null;

              expect(doc._items).to.have.length(initialItems.length);

              done();

            })
          });
        })


      });
    });

    it('delete an item', function (done) {

      OrderItem.delete(itemId, function (err, doc) {
        expect(err).to.be.null;
        expect(doc).to.be.not.null;

        var deletedId = doc._id;
        expect(deletedId).to.be.not.null;
        expect(deletedId.toString()).to.be.eq(itemId);
        expect(doc._parent.toString()).to.be.eq(orderId);

        Order.findById(orderId, function(err, doc){

          expect(err).to.be.null;
          expect(doc._items).to.not.contain(deletedId);

          done();
        })
      });
    });
  });
});
