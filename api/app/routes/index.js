module.exports = function (app) {
  'use strict';

  var order = require('../resource/order'),
      api = require('../resource/api'),
      account = require('../resource/account'),
      authenticator = require('../resource/authenticator'),
      pay = require('../resource/pay'),
      restrictions = require('../middleware/allowHeadersMiddleware');

  app.use(function (req, res, next) {
    res.locals.api = ['/api/authenticator/', '/api/order/', '/login'];
    next();
  });

  app.map({
    '/': {
      get: api,
      options: restrictions.collection
    },
    '/api': {
      get: api,
      '/authenticator/': {
        post: [authenticator.logIn('/api/account/', api), authenticator.rememberMe],
        options: restrictions.collection
      }
    }
  });

  app.mapWithAuthentication({
    '/api/': {
      'account/': {
        get: authenticator.collection('/api/'),
        ':sid': {
          delete: authenticator.logOut(api),
          get: authenticator.item('/api/account/')
        }
      },
      'order/': {
        get: order.list('/api/'),
        post: order.create,
        options: restrictions.collection,
        ':oid': {
          get: order.item('/api/order/'),
          put: order.update,
          delete: order.del,
          options: restrictions.item,
          '/pay/': {
            post: order.pay(pay.create),
            ':pid': {
              get: pay.item('/api/pay/')
            }
          }
        }
      },
      'pay/': {
        get: pay.list,
        post: pay.create,
        ':pid': {
          get: pay.item('/api/pay/'),
          put: pay.update,
          delete: pay.delete
        }
      }
    }
  });

};