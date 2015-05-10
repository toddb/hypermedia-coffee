'use strict';

var Pay = require('../model').Pay;

exports.delete = function (req, res) {
  Pay.delete(req.params.pid, res.NoResponseRepresentation);
};

exports.item = function (parent) {
  return function (req, res) {
    var url = res.locals.self;
    Pay.getItem(req.params.pid, function (err, doc) {
      res.toFeedItemRepresentation(err, doc, url, function (representation) {
        representation.addLink('up', res.locals.schema + parent + req.params.oid);
      });
    });
  };
};

exports.list = function (req, res) {
  var url = res.locals.request_url;
  Pay.getCollection(function (err, doc) {
    res.toFeedRepresentation(err, doc, url);
  });
};

exports.create = function (req, res) {
  Pay.post(req.body, function (err, id) {
    res.toCreatedRepresentation(err, id);
  });
};

exports.update = function (req, res) {
  Pay.put(req.params.pid, req.body, res.NoResponseRepresentation);
};