'use strict';

var should = require('should'),
    path = require('path'),
    link = require(path.resolve('./app/util/linkRelation')),
    request = require('supertest'),
    mongoose = require('mongoose'),
    url = require('url'),
    config = require(path.resolve('./app/config/')),
    express = require(path.resolve('./app/config/express'));

var isPresent = /^$|\S+/;

// Supertest does not accept absolute paths
var pathname = function (uri) {
  return url.parse(uri).pathname;
}

describe('Authenticated session', function () {
  var app, agent, credentials, apiResource;

  before(function (done) {
    app = express.init(mongoose);
    agent = request.agent(app);

    // TODO: use API to create
    var Account = require(path.resolve('./app/resource')).Account;
    Account.create({
      username: config.testuser.name,
      email: config.testuser.email,
      password: config.testuser.password
    }, function (err, doc) {
      if (err) {
        if (err.code == 11000) {
          console.log('Account: ' + config.testuser.name + ' exists.\n');
        } else {
          console.log(err);
        }
      } else {
        console.log('Account: ' + doc.username + " saved.\n");
      }
      done();
    });


  });

  before(function authenticate(done) {
    agent.get('/api/')
        .accept('json')
        .expect(200)
        .end(function (err, res) {

          if (err) done(err);

          apiResource = res.body;

          credentials = {
            Cookie: res.header['set-cookie'][0].split(';')[0]
          }

          agent.post(pathname(link.getUrl(apiResource, 'authenticator')))
              .accept('json')
              .set(credentials)
              .send({username: config.testuser.name, password: config.testuser.password})
              .expect('location', isPresent)
              .expect(201, done)
        });
  });


  describe('Creating an order', function () {
    var orderResource, orderPaymentResource;

    it('should place an order', function (done) {
      agent.post(pathname(link.getUrl(apiResource, 'orders')))
          .accept('json')
          .set(credentials)
          .send({type: 'medium'})
          .expect('location', isPresent)
          .expect(201)
          .end(function (err, resp) {

            agent.get(pathname(resp.header['location']))
                .accept('json')
                .set(credentials)
                .expect(200)
                .end(function (err, res) {
                  orderResource = res.body;
                  done();
                })
          });
    });

    it('should pay on new item', function (done) {
      agent.post(pathname(link.getUrl(orderResource, 'pay')))
          .accept('json')
          .set(credentials)
          .send({token: '345d77568gq4GSDG78'})
          .expect('location', isPresent)
          .expect(201)
          .end(function (err, res) {

            agent.get(pathname(res.header['location']))
                .accept('json')
                .set(credentials)
                .expect(200)
                .end(function (err, res) {
                  orderPaymentResource = res.body;

                  agent.get(pathname(link.getUrl(orderResource, 'self')))
                      .accept('json')
                      .set(credentials)
                      .expect(200)
                      .end(function (err, res) {
                        orderResource = res.body;
                        done();
                      })
                })

          });

    });

  });

});
