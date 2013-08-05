/**
 *
 * Requested url:
 *
 * Add the requested full url to the response object ready for links
 *
 *
 * @param port
 * @return
 */
module.exports = function requestedUrl(port) {
  'use strict';

  function schema(protocol, host, port) {
    return protocol + '://' + host + ( port == 80 || port == 443 ? '' : ':' + port);
  }

  return function url(req, res, next) {
    res.locals.schema = schema(req.protocol, req.host, port);
    res.locals.request_url = res.locals.self = res.locals.schema + req.path;
    next();
  };
};
