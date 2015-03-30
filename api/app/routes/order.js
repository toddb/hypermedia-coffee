'use strict';
var Resource = require('../resource/index').Order;

exports.list = function (req, res) {
  Resource.get(res.locals.self, function (err, doc) {
    if (err) return res.status(501).send(err);
    res.type('application/json');
    res.set({ Allow: 'GET,POST'});
//    res.etag();
    doc.addLink('create-form', 'text/html', res.locals.self + 'post.html');
    res.send(doc);
  });
};

exports.create = function (req, res) {
  Resource.post(req.body, function (err, id) {
    if (err) return res.status(501).send(err);
    res.set({Location: res.locals.self + id});
    res.set({'Content-type': 'application/json'});
    res.status(201).send({});
  });
};

/*
 parent and child collections of the resource
 */
exports.item = function (parent, child) {
  return function (req, res) {
    Resource.get(req.params.oid, res.locals.schema + parent + req.params.oid, function (err, doc, model) {
      if (err) return res.status(501).send(err);
      res.type('application/json');
      res.set({ Allow: 'GET,DELETE,PUT'});

      doc.addLink('delete-form', 'text/html', res.locals.schema + parent + 'delete.html');
      doc.addLink('edit-form', 'text/html', res.locals.schema + parent + 'put.html');
      doc.addLink('collection', res.locals.schema + parent);
      doc.addLink('viewstate', res.locals.schema + parent + req.params.oid + child + 'current');

      // TODO: refactor to resource
      model._actions.forEach(function (rel) {
        doc.addLink(rel, res.locals.self + '/' + rel + '/');
        doc.addLink('create-form', 'text/html', res.locals.schema + rel + 'post.html');
      });
      res.etag(model.id, model.modified);
      res.send(doc);
    });
  };
};

exports.update = function (req, res) {
  Resource.put(req.params.oid, req.body, function (err, doc) {
    console.log(err)
    if (err) return res.status(501).send(err);
    res.send(204);
  });
};

exports.del = function (req, res) {
  Resource.delete(req.params.oid, function (err) {
    if (err) return res.status(501).send(err);
    res.sendStatus(204);
  });
};

exports.pay = function (fn) {
  return function (req, res) {
    req.body.order = req.params.oid;
    fn(req, res);
  };
};