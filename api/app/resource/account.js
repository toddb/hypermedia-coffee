'use strict';

var Resource = require('../model/index').Account;

exports.delete = function (req, res) {
  Resource.delete(req.params.uid, function (err) {
    // if no cookie then just quietly die
    res.send(204);
  });
};

exports.item = function (req, res) {
  Resource.get(req.params.uid, '/account/', function (err, doc) {
    res.type('application/json');
    res.send(doc);
  });
};

exports.list = function (req, res) {
  // TODO: something that resembles an implementation
  Resource.get(res.locals.request_url, function (err, doc) {
    if (err) res.status(501).send(err);
    res.type('application/json');
    res.send(doc);
  });
};

// this will be used to create an account (rather than for authentication)
exports.create = function (req, res) {
  Resource.post(req.body, function (err, id) {
    if (err) res.status(501).send(err);
    res.set({Location: res.locals.request_url + id});
    res.send(201, {});
  });

};