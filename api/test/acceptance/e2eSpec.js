'use strict';

var should = require('should'),
    _ = require('underscore'),
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

  before(function startup() {

    app = express.init(mongoose);
    agent = request.agent(app);

  });

  before(function apiCredentials(done) {

    agent.get('/api/')
        .accept('json')
        .expect(200)
        .end(function (err, res) {

          if (err) done(err);

          apiResource = res.body;

          credentials = {
            Cookie: res.header['set-cookie'][0].split(';')[0]
          }

          done();
        });
  });

  before(function register(done) {

    agent.get(pathname(link.getUrl(apiResource, 'authenticator')))
        .accept('json')
        .set(credentials)
        .expect(200)
        .end(function (err, res) {

          agent.get(pathname(link.getUrl(res.body, 'register')))
              .accept('json')
              .set(credentials)
              .end(function (err, res) {

                var registrationDetails = _.extend({}, res.body, {
                  username: config.testuser.name,
                  email: config.testuser.email,
                  password: config.testuser.password
                });

                agent.post(pathname(link.getUrl(res.body, 'self')))
                    .accept('json')
                    .set(credentials)
                    .send(registrationDetails)
                    .expect(/200|409|User already exists/, done);
              });
        });
  });

  before(function authenticate(done) {

    agent.post(pathname(link.getUrl(apiResource, 'authenticator')))
        .accept('json')
        .set(credentials)
        .send({username: config.testuser.name, password: config.testuser.password})
        .expect('location', isPresent)
        .expect(201, done);
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
