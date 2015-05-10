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

describe('Order', function () {
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
              .expect(/200|409|User already exists/);
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

  describe('Creating an order', function () {

    var orderCollectionResource;

    before(function createEmptyOrderCollection() {
      return agent
          .post(pathname(link.getUrl(apiResource, 'orders')))
          .accept('json')
          .set(credentials)
          .send({})
          .expect('location', isPresent)
          .expect(201)
          .then(function (res) {

            return agent
                .get(pathname(res.header['location']))
                .accept('json')
                .set(credentials)
                .expect(200)
                .then(function (res) {
                  orderCollectionResource = res.body;
                 });
          });
    });

    it('should create a new order without any items', function () {

      expect(orderCollectionResource.items).to.be.defined;
      expect(orderCollectionResource.items).to.be.empty;

      expect(orderCollectionResource._items).to.be.undefined;
      expect(orderCollectionResource._payments).to.be.undefined;
    });

    describe('Order Item', function () {

      var newOrder = {type: 'med'};
      var orderUrl;

      before(function createNewOrder() {

        return agent
            .get(pathname(link.getUrl(orderCollectionResource, 'create-form')))
            .accept('json')
            .set(credentials)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.be.not.null;
              expect(res.body.type).to.be.defined;
              // update the form (we should be checking that this field already exists
              var order = _.extend(res.body, newOrder);

              // create the resource on the collection
              return agent
                  .post(pathname(link.getUrl(orderCollectionResource, 'create-form')))
                  .accept('json')
                  .set(credentials)
                  .send(order)
                  .expect('location', isPresent)
                  .expect(201)
                  .then(function (res) {
                    orderUrl = res.header['location'];
                  });
            })
      });

      it('should create a new order item on order', function () {

        return agent
            .get(pathname(orderUrl))
            .accept('json')
            .set(credentials)
            .expect(200)
            .then(function (res) {
              var order = res.body;
              expect(order.type).to.equal('med');
              expect(order.modified).to.be.defined;

              return agent
                  .get(pathname(link.getUrl(orderCollectionResource, 'self')))
                  .accept('json')
                  .set(credentials)
                  .expect(200)
                  .then(function (res) {
                    expect(res.body.items).to.have.length(1);
                  })

            });


      });

      it('should be able to delete an item order and it not be returned in the collection', function () {
        var items

        return agent
            .get(pathname(link.getUrl(orderCollectionResource, 'self')))
            .accept('json')
            .set(credentials)
            .expect(200)
            .then(function (res) {
              items = res.body.items;
              expect(items).to.be.defined;

              return agent
                  .del(pathname(orderUrl))
                  .set(credentials)
                  .expect(204);

            })
            .then(function (res) {

              return agent
                  .get(pathname(link.getUrl(orderCollectionResource, 'self')))
                  .accept('json')
                  .set(credentials)
                  .expect(200)
                  .then(function (res) {
                    expect(res.body.items).to.be.defined;
                    expect(res.body.items).to.have.length.lessThan(items.length);
                  });
            })
            .then(function (res) {

              return agent
                  .get(pathname(orderUrl))
                  .accept('json')
                  .set(credentials)
                  .expect(404);

            });
        ;

      });

    });

  });

});
