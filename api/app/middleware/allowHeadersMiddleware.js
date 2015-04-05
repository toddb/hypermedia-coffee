'use strict';

// TODO: should be middleware

function setAllow(req, res, header) {
  res.set({
    Allow: header
  });
  res.send(204);
};

exports.item = function (req, res) {
  setAllow(req, res, 'GET,DELETE,PUT,OPTIONS');
};

exports.collection = function (req, res) {
  setAllow(req, res, 'GET,POST,OPTIONS');
};

exports.readonly = function (req, res) {
  setAllow(req, res, 'GET,OPTIONS');
};

exports.removeonly = function (req, res) {
  setAllow(req, res, 'GET,DELETE,OPTIONS');
};

exports.noCache = function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
};

exports.selfWithout = function (alias) {
  return function (req, res, next) {
    res.locals.self = res.locals.self.replace(alias, "");
    next();
  }
};
