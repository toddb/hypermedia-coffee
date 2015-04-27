'use strict';

var should = require('should'),
    _ = require('underscore'),
    path = require('path'),
    link = require(path.resolve('./src/util/linkRelation')),
    request = require('supertest'),
    mongoose = require('mongoose'),
    url = require('url'),
    config = require(path.resolve('./src/config/')),
    express = require(path.resolve('./src/config/express'));

var isPresent = /^$|\S+/;

// Supertest does not accept absolute paths
var pathname = function (uri) {
  return url.parse(uri).pathname;
}

describe('Account', function () {
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

  describe('Create and Delete:', function () {

    var random = Math.floor((Math.random() * 32000) + 1).toString();

    var user = {
      username: 'bob' + random,
      email: 'bob' + random + '@nowhere.com',
      password: 'secret'
    };

    before(function (done) {
      agent.get(pathname(link.getUrl(apiResource, 'authenticator')))
          .accept('json')
          .set(credentials)
          .expect(200)
          .end(function (err, res) {

            agent.get(pathname(link.getUrl(res.body, 'register')))
                .accept('json')
                .set(credentials)
                .end(function (err, res) {

                  var registrationDetails = _.extend({}, res.body, user);

                  agent.post(pathname(link.getUrl(res.body, 'self')))
                      .accept('json')
                      .set(credentials)
                      .send(registrationDetails)
                      .expect(201, done)
                });
          });
    });

    it('should be able to register an account and authenticate', function (done) {

      agent.post(pathname(link.getUrl(apiResource, 'authenticator')))
          .accept('json')
          .set(credentials)
          .send(user)
          .expect('location', isPresent)
          .expect(201, function (err, res) {
            done();
          });
    });

    it('should be able to delete an account by choosing from authenticator resource', function (done) {

      agent.get(pathname(link.getUrl(apiResource, 'authenticator')))
          .accept('json')
          .set(credentials)
          .expect(200)
          .end(function (err, res) {

            agent.get(pathname(res.body.items[0].id))
                .accept('json')
                .set(credentials)
                .end(function (err, res) {

                  agent.delete(pathname(link.getUrl(res.body, 'self')))
                      .set(credentials)
                      .expect(204, done)

                });

          });
    });
  });

});
