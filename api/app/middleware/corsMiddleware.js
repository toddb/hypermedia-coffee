/**
 *
 * Allow cross domain:
 *
 * Implements server-side CORS rules. All requests return header `Access-Control-Allow-Origin`. All non-OPTIONS requests
 * have headers: `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers`.
 *
 * See http://stackoverflow.com/questions/11001817/allow-cors-rest-request-to-a-express-node-js-application-on-heroku
 *
 * For more information on CORS https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 * Good tutorial: http://www.html5rocks.com/en/tutorials/cors/
 * and flowchart of serverside request http://www.html5rocks.com/static/images/cors_server_flowchart.png
 *
 * Options:
 *
 *   - `origin`         Whitelisted domain (default:`*`)
 *   - `methods`        Whitelisted HTTP verbs (default:`GET,PUT,POST,DELETE,OPTIONS`)
 *   - `headers`        Whitelisted headers (default:`Origin, Accept, X-Requested-With,Content-Type`)
 *   - `expose_headers` Headers exposed back on the client (default:`Allow,Location`)
 *   - `credentials`    Credentials able to be send by client
 *
 *   Note: other libraries are https://github.com/antono/connect-cors
 *
 * @param options
 * @return {Function}
 */
exports = module.exports = function allowCrossDomain(app) {

  'use strict';

  var methods = 'GET,PUT,POST,DELETE,OPTIONS',
      headers = 'Origin, Accept, X-Requested-With,Content-Type',
      exposed_headers = 'Allow,Location',
      credentials = true;

  app.use(function (req, res, next) {
    //console.log(req.headers)
    res.header('Access-Control-Allow-Origin', req.headers.origin || req.headers.host);   // TODO: get around wildcard limitations in browser
    res.header('Access-Control-Expose-Headers', exposed_headers);
    if (credentials) res.header('Access-Control-Allow-Credentials', credentials);
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Methods', methods);
      res.header('Access-Control-Allow-Headers', headers);
      res.sendStatus(204)
    } else {
      next();
    }
  });
};
