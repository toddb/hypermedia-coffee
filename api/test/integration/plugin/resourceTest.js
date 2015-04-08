/*jslint node: true */
'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    RepositoryPlugin = require('../../../app/model/plugin/resource');

var Schema = new mongoose.Schema({
  username: {type: String, required: true}
})
Schema.plugin(RepositoryPlugin);
var Resource = mongoose.model('test', Schema);

var id, acct = {username: 'bob'};

module.exports = {

  'resource: Plugin': {
    'collection': {
      'POST - returns ID of 24 long eg 5110709e4ba4ec7115000011': function (done) {
        Resource.remove({}, function () {
        });
        Resource.post(acct, function (err, _id_) {
          id = _id_;
          id.should.match(/[0-9a-z]{24}/);
          done(err);
        });
      },
      'GET - (without id) returns collections of resource': function (done) {
        Resource.getCollection(function (err, doc) {
          done(err);
        });
      }
    },
    'item': {
      'GET - with id returns item resource': function (done) {
        Resource.getItem(id, function (err, doc) {
          doc.username.should.match(/bob/);
          done(err);
        });
      },
      'PUT - full update with returning doc': function (done) {
        Resource.put(id, {username: 'xx'}, function (err, doc) {
          doc.__v.should.equal(1);
          doc.username.should.equal('xx');
          done(err);
        });
      },
      'DELETE - returns deleted doc': function (done) {
        Resource.delete(id, function (err, doc) {
          should.exist(doc);
          done();
        });
      }
    }
  }
};