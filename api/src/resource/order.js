'use strict';
var Order = require('../model').Order;

exports.list = function (parent, child) {
  return function (req, res) {
    var url = res.locals.self;
    Order.getCollection(function (err, doc) {
      res.toFeedRepresentation(err, doc, url, function (representation) {
        representation.addLink('up', res.locals.schema + parent);
        //representation.addLink('create-form', url);
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
    Order.getItem(req.params.oid, function (err, doc) {
      res.toFeedItemRepresentation(err, doc, url,

          function (representation) {
            representation.addLink('up', res.locals.schema + parent);
            // TODO create-form should replaced with an action
            representation.addLink('create-form', url + child)
            representation.addLinks(doc._actions, function (rel) {
              return res.locals.self + '/' + rel + '/'
            })

            representation.addCollection(url, doc._items, function (id) {
              return {
                id: url + child + id
              };
            })
          }
      );
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
    req.body._parent = req.params.oid;
    fn(req, res);
  };
};