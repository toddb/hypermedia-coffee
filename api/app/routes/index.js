module.exports = function (app, auth) {
  'use strict';

  var verbose = false;
  app.mapWithAuthentication = function (a, route) {
    app.map(a, route, true);
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
          if (verbose) console.log('%s %s', key, route);
          var cb = [route];
          if (authenticated) cb.push(auth.ensureAuthenticated);
          cb.push(a[key]);
          app[key].apply(app, cb);
          break;
        // get: [function(){ ... }, function { ... }]
        case Array:
          if (verbose) console.log('%s %s', key, route);
          var cb = [route];
          if (authenticated) cb.push(auth.ensureAuthenticated);
          for (var i = 0; i < a[key].length; i++) {
            cb.push(a[key][i]);
          }
          app[key].apply(app, cb);
          break;
      }
    }
  };

  var viewstate = require('./viewstate')
    , order = require('./order')
    , api = require('./api')
    , restrictions = require('./restrictions')
    , account = require('./account')
    , session = require('./session')
    , pay = require('./pay')
    //, home = require('./home')(app)
    ;

  app.map({
    '/': {
      get: api(['/session/', '/order/']) ,
      options: restrictions.collection
    },
    '/api': {
      get: api(['/session/', '/api/order/'])
    },
    '/session/': {
      get: session.collection,
      post: [auth.login, auth.rememberMe],
      options: restrictions.collection
    }
  });

  app.map({
    '/session/': {
      ':sid': {
        delete: auth.logout,
        get: session.item('/session/')
      }
    },
    '/account/': {
      ':uid': {
        get: account.item,
        delete: account.delete,
        post: account.create,
        options: restrictions.removeonly
      }},
    '/order/': {
      get: order.list,
      post: order.create,
      options: restrictions.collection,
      ':oid': {
        get: order.item('/order/', '/view/'),
        put: order.update,
        del: order.del,
        options: restrictions.item,
        '/pay/': {
          post: order.pay(pay.create)
        },
        '/view/': {
          'current': {
            get: [restrictions.noCache, restrictions.selfWithout(/current$/), viewstate.itemByOrderId]
          },
          get: viewstate.list,
          options: restrictions.collection,
          ':vid': {
            put: viewstate.update,
            get: viewstate.item('/order/', '/view/'),
            options: restrictions.readonly
          }
        }
      }
    },
    '/pay/': {
      get: pay.list,
      post: pay.create,
      ':pid': {
        get: pay.item('/pay/'),
        put: pay.update,
        del: pay.delete
      }
    }
  }, true);

};