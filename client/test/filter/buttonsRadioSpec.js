define(['mocks', 'angular-ui-utils', 'src/scripts/directive/buttonsRadio'], function () {
  'use strict';

  describe('Radio buttons', function () {

    var createElement, scope, elm;

    beforeEach(module('controllers'));
    beforeEach(module('ui.utils'));

    beforeEach(inject(function ($rootScope, $compile) {
      scope = $rootScope;
      createElement = function (elm) {
        elm = angular.element(elm);
        $compile(elm)(scope);
        scope.$digest();
        return elm
      };
    }));

    beforeEach(function () {
      elm = createElement('<buttons-radio name="type" model="item" options="small medium large"></buttons-radio>');
    });

    it('should have three options humanised', function () {
      expect(elm.text()).toBe('SmallMediumLarge');
    });

    it('should have three buttons', function () {
      expect(elm.find('button').length).toBe(3)
    });

    it('should have click handler for activate', function () {
      expect(elm.find('button').attr('ng-click')).toBe('activate(option)');
    });

  });
});