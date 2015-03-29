define(['angular', './filterModule'], function (angular) {
  'use strict';

  return angular
      .module('filters')
      .filter('isEmpty', function () {
        return function (array) {
          return angular.isUndefined(array) || (angular.isArray(array) ?
                  array.length :
                  array.size) != 0;
        }
      });
});