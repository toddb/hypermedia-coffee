'use strict';

module.exports = function (req, res) {
  res.toRepresentation(res.locals.request_url,  function (representation) {
    representation.addLink("orders", res.locals.schema + res.locals.api[1]);
    representation.addLink("authenticator", res.locals.schema + res.locals.api[0]);
    representation.addLink("authenticator", 'text/html', res.locals.schema + res.locals.api[2]);
  });
};
