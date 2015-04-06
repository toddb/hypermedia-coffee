/*jslint node: true */
'use strict';

var should = require('should'),
    Account = require('../../app/model/index').Account,
    acct = {username: 'someone', email: 'bob@nowhere.com', password: 'secret'},
    id;

module.exports = {

  'resource: Account': {

    'collection': {
      'POST - requires unique username and email': function (done) {
        Account.remove({}, function () {
        });
        Account.post(acct, function (err, _id_) {
          id = _id_;
          id.should.not.be.null;
          done();
        });
      },
      'GET': function (done) {
        Account.getCollection('/account/', function (err, doc) {
          doc.length.should.equal(1);
          done(err);
        });
      }
    },
    'item': {
      'GET': function (done) {
        Account.get(id, '/account/', function (err, doc) {
          doc.username.should.match(/someone/);
          done();
        });
      },
      'PUT': function (done) {
        acct.username = 'someoneelse';
        Account.put(id, acct, function (err, doc) {
          var o = doc.toObject();
          should.not.exist(err);
          o.__v.should.equal(1);
          o.username.should.equal('someoneelse');
          done();
        });
      },
      'DELETE': function (done) {
        Account.delete(id, function (err) {
          should.not.exist(err);
          done();
        });
      }
    }
  }
};