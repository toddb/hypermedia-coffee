define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';


  return controllers.controller(
      'CouponCtrl',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', 'link', '$timeout',
        function OrderController($scope, $log, $location, $http, uriMapper, link, $timeout) {

          function addCoupon(coupon) {
            $scope.coupon = coupon;
          }

          $scope.gotoNextState = function gotoNextState() {
            var self = link.getUrl($scope.coupon, /pay/);
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

          $scope.delete = function(){
            link.delete($scope.coupon, 'self')
                .then(function success(){
                  $log.info("Deleted")
                })
          }

          $scope.init = function () {
            $log.info("Loading OrderController");
            $scope.coupon = {};

            var apiUri = uriMapper.fromSitePath($location.path(), '/orders/order/a/');
            $http(
                {
                  method: 'GET',
                  url: apiUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {
                  $log.debug(response.data)
                  addCoupon(_.extend(
                      response.data
                  ))
                }, $log.error);
          };

          $scope.init();
        }
      ]);
});