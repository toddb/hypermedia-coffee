module = module.exports = function (app) {

  var verbose = app.get('verbose') || false;

  app.map = function (a, route) {

    route = (typeof route == 'boolean') ? '' : route || '';
    for (var key in a) {
      switch (a[key].constructor) {
        // { '/path': { ... }}
        case Object:
          app.map(a[key], route + key);
          break;
        // get: function(){ ... }
        case Function:
          if (verbose) console.log('%s %s', key, route);
          var cb = [route];
          cb.push(a[key]);
          app[key].apply(app, cb);
          break;
        // get: [function(){ ... }, function { ... }]
        case Array:
          if (verbose) console.log('%s %s', key, route);
          var cb = [route];
          for (var i = 0; i < a[key].length; i++) {
            cb.push(a[key][i]);
          }
          app[key].apply(app, cb);
          break;
      }
    }
  };

}