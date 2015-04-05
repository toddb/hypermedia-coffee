'use strict';

var Resource = require('../resource/index').Pay;

exports.delete = function (req, res) {
  Resource.delete(req.params.pid, function (err) {
    if (err) return res.status(501).send(err);
    res.sendStatus(204);
  });
};

exports.item = function (parent) {
  return function (req, res) {
    Resource.get(req.params.pid, res.locals.schema + parent, function (err, doc) {
      if (err) return res.status(501).send(err);
      res.type('application/json');
      doc.addLink('up', res.locals.schema + parent);
      res.send(doc);
    });
  };
};

exports.list = function (req, res) {
  Resource.get(res.locals.request_url, function (err, doc) {
    if (err) return res.status(501).send(err);
    res.type('application/json');
//    doc.addLink('create-form', 'text/html', res.locals.self + 'post.html');
    res.send(doc);
  });
};

exports.create = function (req, res) {
  Resource.post(req.body, function (err, id) {
    if (err) return res.status(501).send(err);
    res.set({Location: res.locals.request_url + id});
    res.status(201).send({});
  });
};

exports.update = function (req, res) {
  Resource.put(req.params.pid, req.body, function (err, doc) {
    if (err) return res.status(501).send(err);
    res.sendStatus(204);
  });
};