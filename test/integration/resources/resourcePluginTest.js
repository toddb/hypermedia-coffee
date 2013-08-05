/*jslint node: true */
'use strict';

var should = require('should')
  , mongoose = require('mongoose')
  , RepositoryPlugin = require('../../../app/resource').ResourcePlugin
  , schema = new mongoose.Schema({
    username: { type: String, required: true }
  })
  , acct = {username: 'bob'}
  , id;

schema.plugin(RepositoryPlugin);

var Resource = mongoose.model('test', schema);

module.exports = {

  'resource: Test Resource Plugin': {
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
//          doc.should.be.a('array');
//          doc.should.be.an.instanceof(Resource);
          var o = doc.toJSON();
          o.links.length.should.equal(4);
          o.links[0].rel.should.equal('self');
          o.links[0].type.should.equal('application/json');
          o.links[0].href.should.equal('/tst/');
          done(err);
        });
      }
    },
    'item': {
      'GET - with id returns item resource': function (done) {
        Resource.get(id, '/tst/', function (err, doc) {
          doc.should.be.a('object');
          var o = doc.toJSON();
          o.links.length.should.equal(1);
          o.username.should.match(/bob/);
          done();
        });
      },
      'PUT - full update with returning doc': function (done) {
        Resource.put(id, {username: 'xx'}, function (err, doc) {
          var o = doc.toObject();
          should.not.exist(err);
          o.__v.should.equal(1);
          o.username.should.equal('xx');
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