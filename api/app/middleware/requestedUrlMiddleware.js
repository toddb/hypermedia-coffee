exports = module.exports = function requestedUrl(app) {
  'use strict';

  function schema(protocol, host, port) {
    return protocol + '://' + host + ( port == 80 || port == 443 ? '' : ':' + port);
  }

  app.use(function url(req, res, next) {
    res.locals.schema = schema(req.protocol, req.hostname, app.get('port'));
    res.locals.request_url = res.locals.self = res.locals.schema + req.path;
    next();
  });
};

