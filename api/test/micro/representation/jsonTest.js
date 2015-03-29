/*jslint node: true */
'use strict';

var should = require('should')
    , mongoose = require('mongoose')
    , Resource = require('../../../app/representation').json;

module.exports = {
  'Representation - json': {
    'ctor': {
      'empty add empty links object only': function () {
        var r = new Resource();
        r.should.be.an.instanceof(Resource);
        r.should.have.property('links').with.lengthOf(0);
      },
      'url only adds link (self)': function () {
        var r = new Resource('/tst');
        r.should.have.property('links').with.lengthOf(1);
        r.links[0].should.have.keys(['rel', 'type', 'href'])
      },
      'array of doc adds collection links (first, last, item)': function () {
        var doc = function () {
          this.toJSON = function () {
            return {_id: '5110709e4ba4ec7115000011'}
          }
        }
        var r = new Resource('/tst', [new doc()]);
        r.should.have.property('links').with.lengthOf(4);
      },
      'single doc adds attrs to object': function () {
        var doc = function () {
          this.toJSON = function () {
            return {user: 'xx'}
          }
        }
        var r = new Resource('/tst', new doc());
        r.should.have.property('user', 'xx');
      }
    },
    'methods': {
      'selfLink - and returns self': function () {
        var r = new Resource();
        var o = r.selfLink('/tst');
        r.should.have.property('links').with.lengthOf(1);
        o.should.equal(r);
        o.should.be.an.instanceof(Resource);
      },
      'collectionLinks - adds first, last and item and returns self': function () {
        var doc = function () {
              this.toJSON = function () {
                return {_id: '5110709e4ba4ec7115000011'}
              }
            }
            , url = '/tst';

        var r = new Resource(url);
        var o = r.collectionLinks(url, [new doc()]);
        r.should.have.property('links').with.lengthOf(4);
        o.should.equal(r);
        o.should.be.an.instanceof(Resource);
      },
      'toJSON - returns itself': function () {
        var doc = function () {
          this.toJSON = function () {
            return {user: 'xx'}
          }
        }
        var r = new Resource('/tst', new doc());
        var o = r.toJSON();
        o.should.have.property('user', 'xx');
        o.should.have.property('links');
        o.should.equal(r);
        o.should.be.an.instanceof(Resource);
      }
    }
  }
};