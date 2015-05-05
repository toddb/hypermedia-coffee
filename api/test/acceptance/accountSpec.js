'use strict';

var should = require('should'),
    expect = require('chai').expect,
    _ = require('underscore'),
    path = require('path'),
    link = require(path.resolve('./src/util/linkRelation')),
    request = require('supertest-as-promised'),
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

  before(function apiCredentials() {

    return agent
        .get('/api/')
        .accept('json')
        .expect(200)
        .then(function (res) {

          apiResource = res.body;

          credentials = {
            Cookie: res.header['set-cookie'][0].split(';')[0]
          };
        });
  });

  describe('Create and Delete:', function () {

    var random = Math.floor((Math.random() * 32000) + 1).toString();

    var user = {
      username: 'bob' + random,
      email: 'bob' + random + '@nowhere.com',
      password: 'secret'
    };

    before(function () {
      return agent
          .get(pathname(link.getUrl(apiResource, 'authenticator')))
          .accept('json')
          .set(credentials)
          .expect(200)
          .then(function (res) {
            return agent
                .get(pathname(link.getUrl(res.body, 'register')))
                .accept('json')
                .set(credentials);

          })
          .then(function (res) {
            var registrationDetails = _.extend({}, res.body, user);

            return agent
                .post(pathname(link.getUrl(res.body, 'self')))
                .accept('json')
                .set(credentials)
                .send(registrationDetails)
                .expect(201);
          });
    });

    it('should be able to register an account and authenticate', function () {

      return agent
          .post(pathname(link.getUrl(apiResource, 'authenticator')))
          .accept('json')
          .set(credentials)
          .send(user)
          .expect('location', isPresent)
          .expect(201);
    });

    it('should be able to delete an account by choosing from authenticator resource', function () {

      return agent
          .get(pathname(link.getUrl(apiResource, 'authenticator')))
          .accept('json')
          .set(credentials)
          .expect(200)
          .then(function (res) {
            return agent
                .get(pathname(res.body.items[0].id))
                .accept('json')
                .set(credentials);

          })
          .then(function (res) {
            return agent
                .delete(pathname(link.getUrl(res.body, 'self')))
                .set(credentials)
                .expect(204);
          });
    });
  });

});
