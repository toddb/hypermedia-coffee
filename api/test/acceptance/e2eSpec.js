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
    log = require(path.resolve('./src/config/logger')),
    express = require(path.resolve('./src/config/express'));

var isPresent = /^$|\S+/;

// Supertest does not accept absolute paths
var pathname = function (uri) {
  log.debug(uri);
  return url.parse(uri).pathname;
}

describe('e2e - authenticated session', function () {
  var app, agent, credentials, apiResource;

  before(function startup() {

    app = express.init(mongoose);
    //mongoose.set('debug', true);
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
          }
        });
  });

  before(function register() {

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

          var registrationDetails = _.extend({}, res.body, {
            username: config.testuser.name,
            email: config.testuser.email,
            password: config.testuser.password
          });

          return agent
              .post(pathname(link.getUrl(res.body, 'self')))
              .accept('json')
              .set(credentials)
              .send(registrationDetails)
              .then(function (res) {
                expect(res.status).to.match(/201|409/);
              })
        });
  });

  before(function authenticate() {

    return agent
        .post(pathname(link.getUrl(apiResource, 'authenticator')))
        .accept('json')
        .set(credentials)
        .send({username: config.testuser.name, password: config.testuser.password})
        .expect('location', isPresent)
        .expect(201);
  });

  describe('Start - ceating an order', function () {

    var orderResource, orderPaymentResource;

    before(function () {
      return agent
          .post(pathname(link.getUrl(apiResource, 'orders')))
          .accept('json')
          .set(credentials)
        //.send({type: 'medium'})
          .expect('location', isPresent)
          .expect(201)
          .then(function (res) {

            return agent
                .get(pathname(res.header['location']))
                .accept('json')
                .set(credentials)
                .expect(200)
                .then(function (res) {
                  orderResource = res.body;
                })
          });
    });


    it('should start an order', function () {
      expect(link.getUrl(orderResource, 'placeOrder')).to.be.not.empty;
      expect(orderResource.state).to.eql('start');
    });

    describe('OrderPlaced - add an item', function () {

      before(function () {
        return agent
            .post(pathname(link.getUrl(orderResource, /placeOrder|create-form/)))
            .accept('json')
            .set(credentials)
            .send({type: 'medium'})
            .expect(201)
            .then(function(res){
              return agent
                  .get(pathname(link.getUrl(orderResource, 'self')))
                  .accept('json')
                  .set(credentials)
                  .expect(200)
                  .then(function (res) {
                    orderResource = res.body;
                  })
            });
      });

      it('should have a pay link relation on order', function () {
        expect(link.getUrl(orderResource, 'pay')).to.be.not.empty;
        expect(orderResource.state).to.eql('orderPlaced');
      });

      it('should pay on new item', function () {

        return agent
            .post(pathname(link.getUrl(orderResource, 'pay')))
            .accept('json')
            .set(credentials)
            .send({token: '345d77568gq4GSDG78'})
            .expect('location', isPresent)
            .expect(201)
            .then(function (res) {
              return agent.get(pathname(res.header['location']))
                  .accept('json')
                  .set(credentials)
                  .expect(200)
                  .then(function(res){
                    orderPaymentResource = res.body;
                    expect(link.getUrl(orderPaymentResource, 'up')).to.eql(link.getUrl(orderResource, 'self'));
                  });

            })
            .then(function (res) {
              return agent.get(pathname(link.getUrl(orderResource, 'self')))
                  .accept('json')
                  .set(credentials)
                  .expect(200)
                  .then(function (res) {
                    orderResource = res.body;
                    expect(orderResource.state).to.eql('paid');
                    expect(link.getUrl(orderResource, 'pickup')).to.be.not.empty;
                  })
            });

      });

    });


  });

});
