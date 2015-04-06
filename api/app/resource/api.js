'use strict';

var Resource = require('../representation/index').json;

module.exports = function (req, res, doc) {
  var representation = new Resource(res.locals.self, doc);
  representation.addLink("orders", res.locals.schema + res.locals.api[1]);
  representation.addLink("authenticator", res.locals.schema + res.locals.api[0]);
  representation.addLink("authenticator", 'text/html', res.locals.schema + res.locals.api[2]);
  res.type('application/json');
  res.send(representation);
};
