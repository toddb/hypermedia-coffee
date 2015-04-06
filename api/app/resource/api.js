'use strict';

module.exports = function (req, res, msg) {
  res.toFeedItemRepresentation(null, res.locals.self, msg, function (representation) {
    representation.addLink("orders", res.locals.schema + res.locals.api[1]);
    representation.addLink("authenticator", res.locals.schema + res.locals.api[0]);
    representation.addLink("authenticator", 'text/html', res.locals.schema + res.locals.api[2]);
  });
};
