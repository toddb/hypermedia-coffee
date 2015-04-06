'use strict';

var Resource = require('../model/index').Account;

exports.delete = function (req, res) {
  Resource.delete(req.params.uid, res.toNoResponseRepresentation);
};

// TODO: broken
exports.item = function (req, res) {
  var url = '/account/';
  Resource.get(req.params.uid, url, function (err, doc) {
    res.toFeedItemRepresentation(err, doc, url);
  });
};

exports.list = function (req, res) {
  // TODO: something that resembles an implementation
  var url = res.locals.request_url;
  Resource.get(url, function (err, doc) {
    res.toFeedRepresentation(err, doc, url);
  });
};

// this will be used to create an account (rather than for authentication)
exports.create = function (req, res) {
  Resource.post(req.body, res.toCreatedRepresentation);
};