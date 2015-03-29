define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';


  return controllers.controller(
      'PayController',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', 'link', '$timeout',
        function PayController($scope, $log, $location, $http, uriMapper, link, $timeout) {

          function addCoupon(coupon) {
            $scope.coupon = coupon;
          }

          $scope.gotoNextState = function gotoNextState(coupon) {
            var self = link.getUrl(coupon, /pay|pickup/);
            if (self) {
              var path = uriMapper.toSitePath(self, '/orders/order/a/');
              $log.debug(self + ' -> ' + path);

              $timeout(function () {
                $location.path(path);
              });
            } else {
              $log.error('Order has no identity');
            }
          };

          $scope.post = function(){
            var apiUri = uriMapper.fromSitePath($location.path(), '/orders/order/pay/a/');
            $http.post(apiUri, $scope.token)
                .then(function success(){
                  $log.info("Paid")
                })
          }

          $scope.init = function () {
            $log.info("Loading PayController");

          };

          $scope.init();
        }
      ]);
});