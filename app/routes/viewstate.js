'use strict';

var Resource = require('../resource').ViewState
  , _ = require('underscore');

exports.list = function (req, res) {
  Resource.get(res.locals.self, function (err, doc) {
    if (err) return res.send(500, err);
    res.type('applcation/json');
    res.set({ Allow: 'GET,POST'});
    res.send(doc);
  });
};

exports.itemByOrderId = function (req, res) {
  Resource.getByViewId(req.params.oid, res.locals.self, function (err, doc, model) {
    if (err) return res.send(500, err);
    res.type('applcation/json');
    res.set({ Allow: 'GET'});
    res.set({ 'Cache-Control': 'private'});
    res.etag(model.id, model.modified);
    res.send(doc);
  });
};

exports.update = function (req, res) {
  req.body.view = req.params.oid;
  Resource.put(req.params.vid, req.body, function (err, doc) {
    if (err) return res.send(500, err);
    res.send(204);
  });
};

exports.create = function (req, res) {
  Resource.post(req.body, function (err, doc, id) {
    if (err) return res.send(500, err);
    res.set({Location: res.locals.self + id});
    res.send(201, {});
  });
};

exports.item = function (parentCollection, selfCollection) {
  return function (req, res) {
    Resource.get(req.params.vid,
      res.locals.schema + parentCollection + req.params.oid + selfCollection + req.params.vid,
      function (err, doc, model) {
        if (err) return res.send(500, err);
        res.type('applcation/json');
        res.set({ Allow: 'GET,PUT'});
        doc.addLink('collection', res.locals.schema + parentCollection + req.params.oid + selfCollection);
        res.set({ 'Cache-Control': 'private'});
        res.etag(model.id, model.modified);
        res.send(doc);
      });
  };
};