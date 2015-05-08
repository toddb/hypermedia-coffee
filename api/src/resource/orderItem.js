'use strict';
var OrderItem = require('../model/orderItem'),
    _ = require('underscore');


exports.list = function (parent, self) {
  return function (req, res) {
    var url = res.locals.self;
    OrderItem.getCollectionByParent(req.params.oid, function (err, doc) {
      res.toFeedRepresentation(err, doc, url,

          function (representation) {
            representation.addLink('up', res.locals.schema + parent);
            representation.addLink('create-form', url + self);
          },

          function (doc) {
            return {
              id: url + self + doc._id,
              title: doc.type
            };
          });
    });
  }
};

exports.create = function (req, res) {
  var model = _.extend({}, req.body, {_parent: req.params.oid});
  OrderItem.post(model, res.toCreatedRepresentation);
};

exports.item = function (parent, child) {
  return function (req, res) {
    var parentUrl = res.locals.schema + parent + req.params.oid;
    var url = parentUrl + child + req.params.oiid;
    OrderItem.getItemByParent(req.params.oiid, req.params.oid, function (err, doc) {
       res.toFeedItemRepresentation(err, doc, url, function (representation) {
        representation.addLink('up', parentUrl);
      });
    });
  };
};

exports.createForm = function (parent) {
  return function (req, res) {
    res.toFeedRepresentation(null, OrderItem.empty(), res.locals.self, function(representation){
      representation.addLink('up', res.locals.schema + parent + req.params.oid);
    });
  }
};

//
//exports.update = function (req, res) {
//  OrderItem.put(req.params.oid, req.body, res.NoResponseRepresentation);
//};

// TODO: ensure that it deletes with correct parent
exports.delete = function (req, res) {
  OrderItem.delete(req.params.oiid, res.toNoResponseRepresentation);
};

