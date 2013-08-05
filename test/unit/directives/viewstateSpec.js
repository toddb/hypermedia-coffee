/*global describe beforeEach it expect inject module angular $ */

define(['mocks'], function () {
  'use strict';

  describe('Viewstate - attributes', function () {

    var scope, makeElem, elm;

    beforeEach(module('app.controllers'));

    beforeEach(inject(function ($rootScope, $compile) {
      scope = $rootScope;
      makeElem = function (attr) {
        elm = angular.element("<span " + attr + "></span>");
        $compile(elm)(scope);
        scope.$digest();
        return elm;
      }
    }));

    angular.forEach(['viewing', 'updating', 'removeable'], function (state) {
      it('should replace ' + state + ' attribute attrs', function () {
        makeElem(state);
        expect(elm.attr('ng-show')).toBe('item.viewstate.' + state)
        expect(elm.attr(state)).toBeUndefined()
      });
    });

    angular.forEach({editable: 'viewing', 'cancelable': 'updating'}, function (state, key) {
      it('should replace ' + state + ' attribute attrs', function () {
        makeElem(key);
        expect(elm.attr('ng-show')).toBe('item.viewstate.updateable && ' + 'item.viewstate.' + state);
        expect(elm.attr('ng-click')).toBe('toggleView(item.viewstate)');
        expect(elm.attr(state)).toBeUndefined()
      });
    });

    it('should toggle flags and call toggle on underlying scope - yes, this is a KLUDGE', function () {
      scope.item = { viewstate: {updating: false, viewing: false}};
      scope.toggle = $.noop;
      spyOn(scope, 'toggle');

      makeElem('editable');
      $(elm).click();

      // values toggled & attributes executed
      expect(scope.toggle).toHaveBeenCalledWith(
        { updating: true, viewing: true },
        [ 'viewing', 'updating', 'removeable', 'updateable' ]);
    });

  });
});