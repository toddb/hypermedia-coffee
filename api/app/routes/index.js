module.exports = function (app) {
  'use strict';

  var order = require('../resource/order'),
      api = require('../resource/api'),
      account = require('../resource/account'),
      session = require('../resource/session'),
      pay = require('../resource/pay'),
      restrictions = require('../middleware/allowHeadersMiddleware');

  app.use(function (req, res, next) {
    res.locals.api = ['/api/session/', '/api/order/', '/login'];
    next();
  });

  app.map({
    '/': {
      get: api,
      options: restrictions.collection
    },
    '/api': {
      get: api,
      '/session/': {
        post: [session.logIn, session.rememberMe],
        options: restrictions.collection
      }
    }
  });

  app.mapWithAuthentication({
    '/api/': {
      'session/': {
        get: session.collection('/api/'),
        ':sid': {
          delete: session.logOut,
          get: session.item('/api/session/')
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