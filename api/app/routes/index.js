module.exports = function (app) {
  'use strict';

  var order = require('./order'),
      api = require('./api'),
      restrictions = require('./restrictions'),
      account = require('./account'),
      session = require('./session'),
      pay = require('./pay');

  app.map({
    '/': {
      get: api(['/api/session/', '/api/order/']),
      options: restrictions.collection
    },
    '/api': {
      get: api(['/api/session/', '/api/order/']),
      '/session/': {
        post: [session.logIn, session.rememberMe],
        options: restrictions.collection
      }
    },
    '/session/': {
      get: session.collection,
      post: [session.logIn, session.rememberMe],
      options: restrictions.collection
    }
  });

  app.mapWithAuthentication({
    '/api/': {
      'session/': {
        get: session.collection,
        ':sid': {
          delete: session.logOut,
          get: session.item('/session/')
        }
      },
      'order/': {
        get: order.list,
        post: order.create,
        options: restrictions.collection,
        ':oid': {
          get: order.item('/order/', '/view/'),
          put: order.update,
          delete: order.del,
          options: restrictions.item,
          '/pay/': {
            post: order.pay(pay.create)
          }
        }
      }
    }
  })

  app.mapWithAuthentication({
    '/session/': {
      ':sid': {
        delete: session.logOut,
        get: session.item('/session/')
      }
    },
    '/account/': {
      ':uid': {
        get: account.item,
        delete: account.delete,
        post: account.create,
        options: restrictions.removeonly
      }
    },
    '/order/': {
      get: order.list,
      post: order.create,
      options: restrictions.collection,
      ':oid': {
        get: order.item('/order/', '/view/'),
        put: order.update,
        delete: order.del,
        options: restrictions.item,
        '/pay/': {
          post: order.pay(pay.create)
        }
      }
    },
    '/pay/': {
      get: pay.list,
      post: pay.create,
      ':pid': {
        get: pay.item('/pay/'),
        put: pay.update,
        delete: pay.delete
      }
    }
  });

};