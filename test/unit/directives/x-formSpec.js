/*global describe beforeEach it expect inject module */

define(['mocks', 'directives/x-form'], function () {
  'use strict';

  describe('x-form - inclusion', function () {

    var scope, compile, elm, $httpBackend;

    beforeEach(module('app.controllers'));

    beforeEach(inject(function ($rootScope, $compile, _$httpBackend_) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope;
      compile = $compile;
    }));

    angular.forEach({post: 'create', 'delete': 'delete', put: 'edit'}, function (media, key) {
      it('should add a form for ' + media + '-form attribute', function () {
        $httpBackend.expectGET('/templates/partials/order/' + key + '.html').
          respond("<form>found</form>", "{'content-type':'text/html'}");
        elm = angular.element('<span ' + media + '-form></span>');

        compile(elm)(scope);
        scope.$digest();
        $httpBackend.flush();

        expect(elm.find('form').text()).toBe('found')
      });
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    })


  });
});