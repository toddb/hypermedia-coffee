var should = require('should'),
    path = require('path'),
    link = require(path.resolve('./app/util/linkRelation')),
    request = require('supertest'),
    mongoose = require('mongoose'),
    config = require(path.resolve('./app/config/')),
    express = require(path.resolve('./app/config/express'));
var isPresent = /^$|\S+/;
var json = {Accept: 'application/json'};
var app, agent, headers, credentials, orderId, payId;

var apiResource;

module.exports = {
  'Route: All': {
    before: function (done) {

      app = express.init(mongoose);
      agent = request.agent(app);

      done();


    },
    'Create': {
      before: function (done) {

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
      },
      'with authentication': {
        before: function (done) {
          var url = link.getUrlPathName(apiResource, 'authenticator');
          agent.post(url)
              .accept('json')
              .set(credentials)
              .send({username: config.testuser.name, password: config.testuser.password})
              .expect(201)
              .expect('location', isPresent)
              .end(function (err, resp) {
                done();
              });

        },
        'creating an order': function (done) {
          agent.post(link.getUrlPathName(apiResource, 'orders'))
              .accept('json')
              .set(credentials)
              .send({type: 'medium'})
              .expect(201)
              .expect('location', /\/order\/.*$/)
              .end(function (err, res) {
                orderId = res.header['location'].match(/order\/(.*)$/)[1];
                done()
              });
        }


      }
    }

  }
};