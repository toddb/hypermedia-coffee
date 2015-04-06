'use strict';
var Order = require('../model').Order;

exports.list = function (parent) {
  return function (req, res) {
    var url = res.locals.self;
    Order.get(url, function (err, doc, aa) {
      res.toFeedRepresentation(err, doc, url, function (representation) {
        representation.addLink('up', res.locals.schema + parent);
      });
    });
  }
};

exports.create = function (req, res) {
  Order.post(req.body, res.toCreatedRepresentation);
};

exports.item = function (parent, child) {
  return function (req, res) {
    var url = res.locals.schema + parent + req.params.oid;
    Order.get(req.params.oid, url, function (err, doc) {
      res.toFeedItemRepresentation(err, doc, url, function (representation) {
        representation.addLink('up', res.locals.schema + parent);
        representation.addLinks(doc._actions, function (rel) {
          return res.locals.self + '/' + rel + '/'
        })
      });
    });
  };
};

exports.update = function (req, res) {
  Order.put(req.params.oid, req.body, res.NoResponseRepresentation);
};

exports.del = function (req, res) {
  Order.delete(req.params.oid, res.NoResponseRepresentation);
};

exports.pay = function (fn) {
  return function (req, res) {
    req.body.order = req.params.oid;
    fn(req, res);
  };
};