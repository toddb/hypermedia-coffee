var should = require('should'),
    path = require('path'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    config = require(path.resolve('./app/config/')),
    express = require(path.resolve('./app/config/express'));

var app, agent, headers, orderId, payId;

function get(url) {
  return agent.
      get(url).
      set(headers);
}
function post(url) {
  return agent.
      post(url).
      set(headers);
}
function put(url) {
  return agent.
      put(url).
      set(headers);
}
function del(url, done) {
  return agent.
      del(url).
      set(headers).
      expect(204, done);
}

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
            post('/session/').
            send({username: config.testuser.name, password: config.testuser.password}).
            expect(201).
            end(function (err, res) {
              res.header.should.have.property('location');
              res.header.should.have.property('access-control-allow-origin');
              res.header.should.have.property('access-control-expose-headers');
              res.header.should.have.property('access-control-allow-credentials');

              headers = {
                Cookie: res.header['set-cookie'][0].split(';')[0],
                Accept: 'application/json'
              }

              done(err)
            });
      });


    },
    beforeEach: function (done) {
      post('/order/').
          send({type: 'medium'}).
          end(function (err, res) {
            orderId = res.header['location'].match(/order\/(.*)$/)[1];
            res.status.should.eql(201);
            done()
          });
    },
    'collection': {
      'POST': function (done) {
        post('/pay/').
            send({order: orderId}).
            end(function (err, res) {
              res.header['location'].should.match(/\/pay\/.*$/);
              payId = res.header['location'].match(/pay\/(.*)$/)[1];
              res.status.should.eql(201);
              done()
            });
      },
      'GET': function (done) {
        get('/pay/').
            expect('Allow', "GET,POST").
            expect(200, done);
      }
    },
    'item': {
      'GET - with id returns item resource': function (done) {
        get('/pay/' + payId).
            expect('Allow', "GET,DELETE,PUT").
            expect(200, done);
      },
      'PUT - full update with returning doc': function (done) {
        put('/pay/' + payId).
            send({order: orderId, token: 'asdfsdfdsfd'}).
            expect(204, done);
      },
      'DELETE - returns deleted doc': function (done) {
        var req = del('/pay/' + payId)
            .end(function () {
            });
        req._server.on('close', function () {
          console.log('server closing');
          done()
        })
      }
    }
  }
};