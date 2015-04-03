module = module.exports = function (app) {

  var verbose = app.get('verbose') || false;

  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    return res.sendStatus(401);
  };

  function logRoute(key, route, authenticated) {
    if (verbose) {
      console.log('%s %s', key, route, (authenticated ? '       [ requires authentication ]' : ''));
    }
  }

  app.mapWithAuthentication = function (route) {
    app.map(route, true);
  };

  app.map = function (a, route, authenticated) {
    authenticated = authenticated || (typeof route == 'boolean') ? route : false;
    route = (typeof route == 'boolean') ? '' : route || '';
    for (var key in a) {
      switch (a[key].constructor) {
        // { '/path': { ... }}
        case Object:
          app.map(a[key], route + key, authenticated);
          break;
        // get: function(){ ... }
        case Function:
          logRoute(key, route, authenticated);
          var cb = [route];
          if (authenticated) cb.push(isAuthenticated);
          cb.push(a[key]);
          app[key].apply(app, cb);
          break;
        // get: [function(){ ... }, function { ... }]
        case Array:
          logRoute(key, route, authenticated);
          var cb = [route];
          if (authenticated) cb.push(isAuthenticated);
          for (var i = 0; i < a[key].length; i++) {
            cb.push(a[key][i]);
          }
          app[key].apply(app, cb);
          break;
      }
    }
  };

}