/*jslint node: true */
'use strict';

var should = require('should')
    , mongoose = require('mongoose')
    , Resource = require('../../../resource').ViewState
    , view = {view: '516c65f533b114cf9e000002'}
    , id, r;

module.exports = {
  'resource: ViewState': {
    'collection': {
      'POST': function (done) {
        Resource.post(view, function (err, _id_) {
          id = _id_;
          done(err);
        });
      },
      'GET': function (done) {
        Resource.get('/viewstate/', function (err, doc) {
          var o = doc.toJSON();
          o.links.length.should.equal(4);
          done(err);
        });
      }
    },
    'item': {
      beforeEach: function (done) {
        Resource.getByViewId('516c65f533b114cf9e000002', '/viewstate/', function (err, doc) {
          r = doc.toJSON();
          done();
        });
      },
      'GET': function () {
        r.links.length.should.equal(1);
        r.viewing.should.be.true;
      },
      'PUT': function (done) {
        r.viewing = false;
        Resource.put(id, r, function (err, doc) {
          var o = doc.toObject();
          should.not.exist(err);
          o.__v.should.equal(1);
          o.viewing.should.be.false;
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