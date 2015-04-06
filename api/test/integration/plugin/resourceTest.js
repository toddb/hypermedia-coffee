/*jslint node: true */
'use strict';

var should = require('should')
    , mongoose = require('mongoose')
    , RepositoryPlugin = require('../../../app/model/plugin/resource')
    , schema = new mongoose.Schema({
      username: {type: String, required: true}
    })
    , acct = {username: 'bob'}
    , id;

schema.plugin(RepositoryPlugin);

var Resource = mongoose.model('test', schema);

module.exports = {

  'resource: Plugin': {
    'collection': {
      'POST - returns ID of 24 long eg 5110709e4ba4ec7115000011': function (done) {
        Resource.remove({}, function () {
        });
        Resource.post(acct, function (err, _id_) {
          id = _id_;
          id.should.match(/[0-9a-z]{24}/);
          done();
        });
      },
      'GET - (without id) returns collections of resource': function (done) {
        Resource.get('/tst/', function (err, doc) {
          doc.length.should.equal(1);
          var first = doc[0];
          first.id.should.equal(id);
          first.username.should.equal(acct.username);
          done(err);
        });
      }
    },
    'item': {
      'GET - with id returns item resource': function (done) {
        Resource.get(id, '/tst/', function (err, doc) {
          doc.username.should.match(/bob/);
          done();
        });
      },
      'PUT - full update with returning doc': function (done) {
        Resource.put(id, {username: 'xx'}, function (err, doc) {
          should.not.exist(err);
          doc.__v.should.equal(1);
          doc.username.should.equal('xx');
          done();
        });
      },
      'DELETE - returns deleted doc': function (done) {
        Resource.delete(id, function (err, doc) {
          should.not.exist(err);
          should.exist(doc);
          done();
        });
      }
    }
  }
};