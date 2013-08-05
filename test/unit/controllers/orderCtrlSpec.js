/*global describe beforeEach it expect inject module */

define(['mocks', 'controllers/orderCtrl'], function () {

  'use strict';
  describe('Orders controllers', function () {

    var collectionLinks = [
        { rel: 'self', href: "/orders/", type: "application/json"}
      ]
      , itemLinks = [
        { rel: 'self', href: "/orders/1", type: "application/json"}
      ]
      , itemAttrs = {attr: 'value'}
      , viewstateLink = { rel: 'self', href: "/viewstate/1", type: "application/json"}
      , viewstate = {
        viewstate: viewstateLink,
        updating: true,
        viewing: false
      }
      , itemReturnWithViewStateLink = { rel: 'viewstate', href: "/orders/1/viewstate/current", type: "application/json"};

    beforeEach(module('app.controllers'));
    beforeEach(module('httpLink'));
    describe('OrdersCtrl', function () {

      var scope, ctrl, deferred, resource, location, $q;

      beforeEach(inject(function ($rootScope, $controller, _$q_, fragment) {
        $q = _$q_;
        var promise = function () {
          deferred = $q.defer();
          return deferred.promise;
        }
        // TODO: refactor these out and use .andReturn(promise) instead of .andCallThrough()
        resource = {
          get: promise,
          post: promise,
          del: promise,
          put: promise
        };

        location = fragment;

        scope = $rootScope.$new();
        ctrl = $controller('OrderCtrl',
          {$scope: scope, fragment: location, Resource: resource});
      }));

      it('init() - should create "orders" model fetched from order resource GET xhr', function () {
        spyOn(resource, 'get').andCallThrough();
        var resources = [itemAttrs, itemAttrs ];
        deferred.resolve({ data: { item: resources, links: collectionLinks}});
        scope.$root.$digest();

        expect(scope.collection.item).toEqualData(resources);
        expect(scope.collection.links).toEqualData(collectionLinks);
      });

      it('should call POST xhr on create and on success add to the orders by 1', function () {
        var get = $q.defer()
          , post = $q.defer();

        spyOn(resource, 'post').andReturn(post.promise);
        spyOn(resource, 'get').andReturn(get.promise);

        scope.collection = {links: collectionLinks};

        scope.create.call(scope, itemAttrs, 'attr');
        post.resolve({ data: { links: [ itemReturnWithViewStateLink ]} });
        get.resolve({ data: viewstate });
        scope.$root.$digest();

        var item = { links: [itemReturnWithViewStateLink], viewstate: viewstate};
        expect(resource.post).wasCalledWith(itemAttrs, scope.collection, 'self');
        expect(resource.get).wasCalledWith(item, 'viewstate');
        expect(scope.collection.item).toEqualData([item]);
      });

      it('should call PUT on update and success set item back to viewing', function () {
        var put = $q.defer();
        spyOn(resource, 'put').andReturn(put.promise);
        spyOn(scope, 'cancel');

        var order = {links: itemLinks};
        scope.order = order;

        scope.update.call(scope, order, 'attr');
        put.resolve();
        scope.$root.$digest();

        expect(resource.put).toHaveBeenCalled();
        expect(scope.cancel).toHaveBeenCalled();
      });

      it('should call DELETE xhr on remove and failed', function () {
        var del = $q.defer();
        spyOn(resource, 'del').andReturn(del.promise);
        var order = {links: collectionLinks};

        scope.order = order;
        scope.collection.push(order);
        var count = scope.collection.length;

        scope.delete.call(scope, order, order);

        del.reject();
        scope.$root.$digest();

        expect(resource.del).wasCalled();
        expect(resource.del).wasCalledWith(order, 'self');
        expect(scope.collection.length).toEqual(count);
      });

      describe('DELETE item from collection with one item', function () {
        // create order and mixin scope index
        var order = {
          links: itemLinks,
          $index: 1
        };

        beforeEach(function () {
          var del = $q.defer();
          spyOn(resource, 'del').andReturn(del.promise);
          spyOn(order, '$index').andCallThrough();

          scope.collection.push(order);

          scope.order = order;
          expect(scope.collection).toEqualData([order]);

          scope.delete.call(scope, order);
          del.resolve();
          scope.$root.$digest();
        });

        it('should call DELETE xhr on remove and on success reduce to the orders by 1', function () {
          expect(resource.del).wasCalled();
          expect(resource.del).wasCalledWith(order, 'self');
        });

        it('should remove item from collection and leave empty collection', function () {
          expect(scope.collection.item.length).toEqual(0);
          expect(scope.collection.item).toEqualData([]);
        })
      });

      describe('ViewState', function () {
        var put;
        beforeEach(function () {
          put = $q.defer();
          spyOn(resource, 'put').andReturn(put.promise);
          spyOn(location, 'set').andCallThrough();
        });
        it('edit - attrs as string', function () {
          scope.edit.call(scope, viewstate, 'viewing');
          put.resolve();
          scope.$root.$digest();
          expect(resource.put).wasCalledWith({ viewing: false }, viewstate, 'self');
          expect(location.set).wasCalledWith(viewstate, 'self');
        });
        it('cancel - attrs as array', function () {
          scope.cancel.call(scope, viewstate, ['viewing', 'updating']);
          put.resolve();
          scope.$root.$digest();
          expect(resource.put).wasCalledWith({ viewing: false, updating: true }, viewstate, 'self');
          expect(location.set).wasCalledWith(viewstate, 'self');
        });
      });

    });
  });
});