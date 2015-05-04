'use strict';

var should = require('should'),
    expect = require('chai').expect,
    _ = require('underscore'),
    path = require('path'),
    link = require(path.resolve('./src/util/linkRelation')),
    request = require('supertest'),
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

    var orderCollectionResource;

    before(function (done) {
      agent.post(pathname(link.getUrl(apiResource, 'orders')))
          .accept('json')
          .set(credentials)
          .send({})
          .expect('location', isPresent)
          .expect(201)
          .end(function (err, res) {

            var orderCollectionUrl = res.header['location'];

            agent.get(pathname(orderCollectionUrl))
                .accept('json')
                .set(credentials)
                .expect(200)
                .end(function (err, res) {
                  orderCollectionResource = res.body;

                  expect(orderCollectionResource.items).to.be.defined;
                  expect(orderCollectionResource.items).to.be.empty;
                  expect(orderCollectionResource._items).to.be.undefined;

                  done();
                });
          });
    });

    it('should create a new order without any items', function (done) {

      agent.get(pathname(link.getUrl(orderCollectionResource, 'self')))
          .accept('json')
          .set(credentials)
          .expect(200)
          .end(function(err, res){
            expect(err).to.be.null;
            expect(res.body.items).to.be.undefined;
            done();
          })

    });

    it('should create a new order item on order', function (done) {

      // Here's the new order
      var newOrder = {type: 'med'};

      // retrieve the create form
      agent.get(pathname(link.getUrl(orderCollectionResource, 'create-form')))
          .accept('json')
          .set(credentials)
          .expect(200)
          .end(function(err, res){

            expect(err).to.be.null;
            expect(res.body).to.be.not.null;

            expect(res.body.type).to.be.defined;
            // update the form (we should be checking that this field already exists
            var order = _.extend(res.body, newOrder);

            // create the resource on the collection
            agent.post(pathname(link.getUrl(orderCollectionResource, 'create-form')))
                .accept('json')
                .set(credentials)
                .send(order)
                .expect('location', isPresent)
                .expect(201)
                .end(function (err, res) {

                  var orderUrl = res.header['location'];
                  expect(err).to.be.null;

                  agent.get(pathname(orderUrl))
                      .accept('json')
                      .set(credentials)
                      .expect(200)
                      .end(function (err, res) {
                        expect(err).to.be.null;

                        var order = res.body;
                        expect(order.type).to.equal('med');
                        expect(order.modified).to.be.defined;

                        agent.get(pathname(link.getUrl(orderCollectionResource, 'self')))
                            .accept('json')
                            .set(credentials)
                            .expect(200)
                            .end(function(err, res){
                              expect(err).to.be.null;
                              expect(res.body.items).to.have.length(1);

                              done();
                            })

                      });

                });
          })

    });


  });

});
