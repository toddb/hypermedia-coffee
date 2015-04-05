define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';


  return controllers.controller(
      'OrderController',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', 'link', '$timeout',
        function OrderController($scope, $log, $location, $http, uriMapper, link, $timeout) {

          function addOrder(order) {
            $scope.order = order;
          }

          $scope.gotoNextState = function gotoNextState() {
            var self = link.getUrl($scope.order, /pay/);
            if (self) {
              var path = uriMapper.toSitePath(self, '/orders/order/pay/a/');
              $log.debug(self + ' -> ' + path);

              $timeout(function () {
                $location.path(path);
              });
            } else {
              $log.error('Order has no identity');
            }
          };

          $scope.delete = function () {
            link.delete($scope.order, 'self')
                .then(function success() {
                  $log.info("Deleted")
                })
          }

          $scope.init = function () {
            $log.info("Loading OrderController");
            $scope.order = {};

            var apiUri = uriMapper.fromSitePath($location.path(), '/orders/order/a/');
            $http(
                {
                  method: 'GET',
                  url: apiUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {
                  addOrder(response.data)
                }, $log.error);
          };

          $scope.init();
        }
      ]);
});