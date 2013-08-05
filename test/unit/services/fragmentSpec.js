/*global describe beforeEach it expect inject module */

define(['mocks'], function () {
  'use strict';

  describe('services/fragment', function () {

    var service, location;

    beforeEach(module('httpLink'));

    beforeEach(inject(function (fragment, $location) {
      service = fragment;
      location = $location;
    }));

    beforeEach(function () {
      spyOn(location, 'host').andReturn('sl.com');
    });

    beforeEach(function () {
      this.links = [
        { rel: "collection", type: "application/json", href: "http://sl.com/order/" },
        { rel: "item", type: "application/json", href: "http://sl.com/order/5454687" }
      ];
    });
    describe('Get - Matches', function () {
      describe('Port 80', function () {
        beforeEach(function () {
          spyOn(location, 'protocol').andReturn('http');
          spyOn(location, 'port').andReturn(80);
        });
        it('finds collection', function () {
          location.url("http://sl.com");
          expect(service.get(this, 'collection')).toBe('/order/');
        });

        it('finds item', function () {
          location.url("http://sl.com");
          expect(service.get(this, 'item')).toBe('/order/5454687');
        });
      });

      describe('Port 443', function () {
        it('finds collection', function () {
          this.links[0].href = "https://sl.com/order/";
          spyOn(location, 'protocol').andReturn('https');
          spyOn(location, 'port').andReturn(443);
          expect(service.get(this, 'collection')).toBe('/order/');
        });
      });

      describe('Port 8888', function () {
        it('finds collection', function () {
          this.links[0].href = "http://sl.com:8888/order/";
          spyOn(location, 'protocol').andReturn('http');
          spyOn(location, 'port').andReturn(8888);
          expect(service.get(this, 'collection')).toBe('/order/');
        });
      });
    });

    describe('GET - no match', function () {
      it('returns original url', function () {
        this.links[0].href = "http://sl.com:8888/order/";
        spyOn(location, 'protocol').andReturn('http');
        spyOn(location, 'port').andReturn(8888);
        expect(service.get(this, 'item')).toBe('http://sl.com/order/5454687', "Angular may need to be patched");
      });
    });

    describe('SET', function () {
      beforeEach(function () {
        spyOn(location, 'protocol').andReturn('http');
        spyOn(location, 'port').andReturn(80);
      });
      it('does not set hash when same', function () {
        spyOn(location, 'hash').andReturn("");
        service.set(this, 'collection', true);
        expect(location.hash).toHaveBeenCalled();
      });
      it('sets hash when has is empty and a new one is to be set', function () {
        spyOn(location, 'hash').andReturn("");
        service.set(this, 'collection');
        expect(location.hash).toHaveBeenCalledWith('/order/');
      });
      it('does reset the hash', function () {
        spyOn(location, 'hash');
        service.set(this, 'collection');
        expect(location.hash).toHaveBeenCalledWith('/order/');
      });
    });

  });
});