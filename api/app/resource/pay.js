'use strict';

var Payment = require('../model').Pay;

exports.delete = function (req, res) {
  Payment.delete(req.params.pid, res.NoResponseRepresentation);
};

exports.item = function (parent) {
  return function (req, res) {
    var url = res.locals.schema + parent;
    Payment.getItem(req.params.pid, function (err, doc) {
      res.toFeedItemRepresentation(err, doc, url, function (representation) {
        representation.addLink('up', res.locals.schema + parent);
      });
    });
  };
};

exports.list = function (req, res) {
  var url = res.locals.request_url;
  Payment.getCollection(function (err, doc) {
    res.toFeedRepresentation(err, doc, url);
  });
};

exports.create = function (req, res) {
  Payment.post(req.body, res.toCreatedRepresentation);
};

exports.update = function (req, res) {
  Payment.put(req.params.pid, req.body, res.NoResponseRepresentation);
};