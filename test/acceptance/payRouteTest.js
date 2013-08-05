var should = require('should')
  , request = require('supertest')
  , app = require('../support/app')();

var auth, orderId, payId;

function get(url) {
  return request(app).
    get(url).
    set('Cookie', auth);
}
function post(url) {
  return request(app).
    post(url).
    set('Accept', "application/json").
    set('Cookie', auth);
}
function put(url) {
  return request(app).
    put(url).
    set('Accept', "application/json").
    set('Cookie', auth);
}
function del(url, done) {
  return request(app).
    del(url).
    set('Cookie', auth).
    expect(204, done);
}

module.exports = {
  'Route: Payments': {
    before: function (done) {
      request(app).
        post('/session/').
        send({ username: 'bob', password: 'secret' }).
        end(function (err, res) {
          auth = res.header['set-cookie'][0].split(';')[0];
          res.status.should.eql(201);
          done(err)
        });

    },
    beforeEach: function (done) {
      post('/order/').
        send({type: 'medium'}).
        end(function (err, res) {
          orderId = res.header['location'].match(/order\/(.*)$/)[1];
          res.status.should.eql(201);
          done(err)
        });
    },
    'collection': {
      'POST': function (done) {
        post('/pay/').
          send({ order: orderId}).
          end(function (err, res) {
            res.header['location'].should.match(/\/pay\/.*$/);
            payId = res.header['location'].match(/pay\/(.*)$/)[1];
            res.status.should.eql(201);
            done(err)
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
          send({ order: orderId, token: 'asdfsdfdsfd'}).
          expect(204, done);
      },
      'DELETE - returns deleted doc': function (done) {
        del('/pay/' + payId, done);
      }
    }
  }
};