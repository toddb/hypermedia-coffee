/*jslint node: true */
'use strict';

var should = require('should'),
    link = require('../../src/util/linkRelation');

module.exports = {
  'HttpLink': {
    before: function () {
      this.links = [
        {rel: "alternate", type: "text/html", href: "http://sl/order/1"},
        {rel: "alternate", type: "application/json", href: "http://sl/order1"},
        {rel: "notes", type: "application/json", href: "http://sl/order/1/note/"},
        {rel: "collection", type: "application/json", href: "http://sl/orders/"},
        {rel: "first", type: "application/json", href: "http://sl/order/1"},
        {rel: "last", type: "application/json", href: "http://sl/order/5"}
      ];
    },
    'GetUri': {
      "should get href uri": function () {
        link.getUrl(this.links, 'collection', 'application/json').should.equal('http://sl/orders/');
      },
      "should not find Uri": function () {
        link.getUrl(this.links, 'collection', 'text/html').should.equal('');
      }
    },

    'Links': {
      "filters on string match": function () {
        link.filter(this.links, 'notes', 'application/json').length.should.equal(1);
        link.filter(this.links, 'alternate', 'application/json').length.should.equal(1);
        link.filter(this.links, 'alternate', 'text/html').length.should.equal(1);
        link.filter(this.links, 'alternate', 'text/css').length.should.equal(0);
      },
      "filters on * wildcard": function () {
        link.filter(this.links, 'alternate', '*').length.should.equal(2);
        link.filter(this.links, '*', 'application/json').length.should.equal(5);
        link.filter(this.links, '*', '*').length.should.equal(6);
      },
      "filters on regular expression": function () {
        link.filter(this.links, /alternate/i, "*").length.should.equal(2);
        link.filter(this.links, /cancel/i, "*").length.should.equal(0);
        link.filter(this.links, '*', /application/i).length.should.equal(5);
        link.filter(this.links, '*', /html/i).length.should.equal(1);
      }

    },

    'matches': {
      "filters on string match": function () {
        link.matches(this.links, 'notes', 'application/json').should.equal(true);
        link.matches(this.links, 'alternate', 'application/json').should.equal(true);
        link.matches(this.links, 'alternate', 'text/html').should.equal(true);
        link.matches(this.links, 'alternate', 'text/css').should.equal(false);
      },
      "filters on * wildcard": function () {
        link.matches(this.links, 'alternate', '*').should.equal(true);
        link.matches(this.links, '*', 'application/json').should.equal(true);
        link.matches(this.links, '*', '*').should.equal(true);
      },
      "filters on regular expression": function () {
        link.matches(this.links, /alternate/i, "*").should.equal(true);
        link.matches(this.links, /cancel/i, "*").should.equal(false);
        link.matches(this.links, '*', /application/i).should.equal(true);
        link.matches(this.links, '*', /html/i).should.equal(true);
      }
    }
  }
};