var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose')
app = require('./app')();

var agent;
var auth, orderId, payId;

function get(url) {
  return agent.
      get(url).
      set('Cookie', auth);
}
function post(url) {
  return agent.
      post(url).
      set('Accept', "application/json").
      set('Cookie', auth);
}
function put(url) {
  return agent.
      put(url).
      set('Accept', "application/json").
      set('Cookie', auth);
}
function del(url, done) {
  return agent.
      del(url).
      set('Cookie', auth).
      expect(204, done);
}

module.exports = {
  'Route: Payments': {
    before: function (done) {

      agent = request.agent(app);

      function startOnceConnection() {
        agent.
            post('/session/').
            send({username: 'bob', password: 'secret'}).
            end(function (err, res) {
              res.status.should.eql(201);
              auth = res.header['set-cookie'][0].split(';')[0];
              res.header.should.have.property('location');
              res.header.should.have.property('access-control-allow-origin');
              res.header.should.have.property('access-control-expose-headers');
              res.header.should.have.property('access-control-allow-credentials');
              done(err)
            });
      }

      mongoose.connection.on('open', startOnceConnection);
      mongoose.connection.on('error', console.log)
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
            .end(function(){});
        req._server.on('close', function(){
          console.log('server closing');
          done()
        })
      }
    }
  }
};