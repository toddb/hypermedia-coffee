define(['controllers/module', 'underscore'], function (module, _) {

    'use strict';

    function OrdersCtrl($scope, $log, location, link) {

      function error(msg) {
        $log.error(msg);
      }

      function add(item) {
        if ($scope.collection && angular.isUndefined($scope.collection.item)) {
          $scope.collection.item = [];
        }
        $scope.collection.item.unshift(item);
      }

      function remove(item) {
        $scope.collection.item = _.reject($scope.collection.item, function (o) {
          return o.$$hashKey == this.$$hashKey
        }, item)
      };

      $scope.init = function () {
        $scope.collection = [];
        link.get('HEAD', {collection: [
          { item: { viewstate: {} }}
        ]}).
          then(function success(response) {
            $scope.collection = response.data;
          }, error);
      };

      $scope.edit = $scope.cancel = $scope.toggle = function (viewstate, attrs) {
        link.put(_.pick(viewstate, attrs), viewstate, 'self');
        location.set(viewstate, 'self');
      };

      $scope.delete = function (item) {
        link.del(item, 'self').
          then(function success() {
            remove(item);
          }, error);
      };

      $scope.create = function (item, attrs) {
        link.post(_.pick(item, attrs), this.collection, 'self').
          then(function success(response) {
            var item = response.data;
            link.get(item, 'viewstate').
              then(function success(response) {
                item.viewstate = response.data;
                add(item);
              }, error)
          }, error);
      };

      $scope.update = function (item, attrs) {
        link.put(_.pick(item, attrs), item, 'self').
          then(function success() {
            $scope.cancel.call($scope, item.viewstate);
          }, error
        );
      };

      $scope.getFragment = function (item) {
        return location.get(item, 'self');
      };

      $scope.init();

    }

    /*
     * Directives for viewstate embedded model
     * These are too tightly coupled to the controller through `.toggle()`
     * This was done to see if I could clean up the view partials and wrap ng-directives
     */


    var item = 'item.viewstate'; // KLUDGE: I didn't want to explicit write a binding in the view - see below

    function obj(attr) {
      return item + "." + attr;
    }

    angular.forEach(['removeable', 'updating', 'viewing'], function (state) {
      module.directive(state, function ($compile) {
        return {
          restrict: 'AC',
          compile: function (elem, attrs) {
            attrs.$set('ngShow', obj(state));
            elem.removeAttr(state);
            return function (scope, elem) {
              $compile(elem)(scope);
            }
          }
        }
      })
    });

    angular.forEach({editable: 'viewing', 'cancelable': 'updating'}, function (state, key) {
      module.directive(key, function ($compile) {
        return {
          restrict: 'AC',
//          scope: { model: '='}, // here is where the explicit binding would be
//          link: function (scope, element, attrs) {  // alternately setup optional binding on model
//            // find attr 'model' and set as necessary on scope
//          },
          controller: ['$scope', function ($scope) {
            $scope.toggleView = function (item) {
              item.viewing = !item.viewing;
              item.updating = !item.updating;
              $scope.toggle(item, ['viewing', 'updating', 'removeable', 'updateable']);
            }
          }],
          compile: function (elem, attrs) {
            attrs.$set('ngShow', obj('updateable') + ' && ' + obj(state));
            attrs.$set('ngClick', 'toggleView(' + item + ')');
            elem.removeAttr(key);
            return function (scope, elem) {
              $compile(elem)(scope);
            }
          }
        };
      })
    });

    return module.
      controller('OrderCtrl', ['$scope', '$log', 'fragment', 'Resource', OrdersCtrl]);
  });