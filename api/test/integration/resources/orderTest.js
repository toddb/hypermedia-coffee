/*jslint node: true */
'use strict';

var Resource = require('../../../app/resource').Order
  , should = require('should');

//var collection = {
//  links:[
//    { rel:"self", type:"application/json", href:"http://localhost:8888/order/" },
//    { rel:"item", type:"application/json", href:"http://localhost:8888/order/786asd87f9s87asd"}
//  ]
//};
//
//var item = {
//  links:[
//    { rel:"self", type:"application/json", href:"http://localhost:8888/order/786asd87f9s87asd" }
//  ],
//  type:"medium"
//};

var id;

module.exports = {
  'resource: Order': {
    'collection': {
      'POST': function (done) {
        Resource.remove({}, function (err, doc) {
        });
        Resource.post({type: 'medium'}, function (err, id) {
          id.should.not.be.null;
          done();
        });
      },
      'GET': function (done) {
        Resource.get('/order/', function (err, doc) {
          doc.toJSON().should.not.be.null;
          done();
        });
      }
    }
  }
};