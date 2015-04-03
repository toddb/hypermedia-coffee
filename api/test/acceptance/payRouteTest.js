var should = require('should'),
    path = require('path'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    config = require(path.resolve('./app/config/')),
    express = require(path.resolve('./app/config/express'));
var isPresent = /^$|\S+/;
var app, agent, headers, orderId, payId;

module.exports = {
  'Route: Payments': {
    before: function (done) {

      app = express.init(mongoose);
      agent = request.agent(app);

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

        agent.
            post('/session/')
            .send({username: config.testuser.name, password: config.testuser.password})
            .expect(201)
            .expect('location', isPresent)
            .expect('access-control-allow-origin', isPresent)
            .expect('access-control-expose-headers', isPresent)
            .expect('access-control-allow-credentials', isPresent)
            .end(function (err, res) {
              headers = {
                Cookie: res.header['set-cookie'][0].split(';')[0],
                Accept: 'application/json'
              }

              done(err)
            });
      });


    },
    beforeEach: function (done) {
      agent.post('/order/')
          .set(headers)
          .send({type: 'medium'})
          .expect(201)
          .expect('location', /\/order\/.*$/)
          .end(function (err, res) {
            orderId = res.header['location'].match(/order\/(.*)$/)[1];
            done()
          });
    },
    'collection': {
      'POST': function (done) {
        agent.post('/pay/')
            .set(headers)
            .send({order: orderId})
            .expect(201)
            .expect('location', /\/pay\/.*$/)
            .end(function (err, res) {
              payId = res.header['location'].match(/pay\/(.*)$/)[1];
              done()
            });
      },
      'GET': function (done) {
        agent.get('/pay/')
            .send(headers)
            .expect('Allow', "GET,POST")
            .expect(200, done);
      }
    },
    'item': {
      'GET - with id returns item resource': function (done) {
        agent.get('/pay/' + payId)
            .send(headers)
            .expect('Allow', "GET,DELETE,PUT")
            .expect(200, done);
      },
      'PUT - full update with returning doc': function (done) {
        agent.put('/pay/' + payId)
            .set(headers)
            .send({order: orderId, token: 'asdfsdfdsfd'})
            .expect(204, done);
      },
      'DELETE - returns deleted doc': function (done) {
        agent.delete('/pay/' + payId)
            .set(headers)
            .expect(204, done);
      }
    }
  }
};