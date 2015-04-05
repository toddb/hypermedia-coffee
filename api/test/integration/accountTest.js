/*jslint node: true */
'use strict';

var should = require('should'),
    Resource = require('../../app/resource/index').Account,
    acct = {username: 'someone', email: 'bob@nowhere.com', password: 'secret'},
    id;

module.exports = {

  'resource: Account': {

    'collection': {
      'POST - requires unique username and email': function (done) {
        Resource.remove({}, function () {
        });
        Resource.post(acct, function (err, _id_) {
          id = _id_;
          id.should.not.be.null;
          done();
        });
      },
      'GET': function (done) {
        Resource.getCollection('/account/', function (err, doc) {
          var o = doc.toJSON();
          o.links.length.should.equal(1);
          done(err);
        });
      }
    },
    'item': {
      'GET': function (done) {
        Resource.get(id, '/account/', function (err, doc) {
          var o = doc.toJSON();
          o.links.length.should.equal(1);
          o.username.should.match(/someone/);
          done();
        });
      },
      'PUT': function (done) {
        acct.username = 'someoneelse';
        Resource.put(id, acct, function (err, doc) {
          var o = doc.toObject();
          should.not.exist(err);
          o.__v.should.equal(1);
          o.username.should.equal('someoneelse');
          done();
        });
      },
      'DELETE': function (done) {
        Resource.delete(id, function (err) {
          should.not.exist(err);
          done();
        });
      }
    }
  }
};