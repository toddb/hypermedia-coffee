module.exports = function (app) {
  'use strict';

  var order = require('../resource/order'),
      orderItem = require('../resource/orderItem'),
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
    '/api/': {
      get: api,
      'authenticator/': {
        get: authenticator.collection('/api/', '/api/account/', 'account/'),
        post: [authenticator.logIn('/api/account/', api), authenticator.rememberMe],
        options: restrictions.collection,
        'account': {
          get: account.createForm('/api/authenticator/'),
          post: account.create
        },
        'logout': {
          post: authenticator.logOut(api)
        }
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
        get: order.list('/api/', '/item/'),
        post: order.create,
        options: restrictions.collection,
        ':oid': {
          get: order.item('/api/order/', '/item/'),
          options: restrictions.item,
          '/placeOrder/': {  /* same as `item` for get and post */
            get: orderItem.createForm('/api/order/', '/item/'),
            post: orderItem.create
          },
          '/item/': {
            get: orderItem.createForm('/api/order/'),
            post: orderItem.create,
            ':oiid': {
              get: orderItem.item('/api/order/', '/item/'),
              delete: orderItem.delete
            }
          },
          '/pay/': {
            post: order.pay(pay.create),
            ':pid': {
              get: pay.item('/api/order/')
            }
          }
        }
      },
      'pay/': {
        get: pay.list,
        post: pay.create,
        ':pid': {
          get: pay.item('/api/order/'),
          put: pay.update,
          delete: pay.delete
        }
      }
    }
  });

};