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
            var self = link.getUrl(coupon, /up/);
            if (self) {
              var path = uriMapper.toSitePath(self, '/orders/order/pickup/a/');
              $log.debug(self + ' -> ' + path);

              $timeout(function () {
                $location.path(path);
              });
            } else {
              $log.error('Unable to move to next state');
            }
          };

          $scope.back = function () {
            var self = link.getUrl($scope.pay, /up/);
            if (self) {
              var path = uriMapper.toSitePath(self, '/orders/order/a/');
              $log.debug(self + ' -> ' + path);

              $timeout(function () {
                $location.path(path);
              });
            } else {
              $log.error('Unable to move to previous state');
            }
          };

          $scope.makePayment = function () {

            // for demonstration purposes we need to pretend as though we recieved an external token
            var randomToken = (function getRandomizer(bottom, top) {
                return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
            })(1, 99999999);

            var payment = {token: randomToken}

            link.post($scope.pay, 'self', 'application/json', _.pick($scope.pay, payment) || {}).
                then(function success(response) {
                  $http.get(response.headers().location, {
                    headers: {
                      'Accept': response.headers()['content-type']
                    }
                  })
                      .then(function success(response) {

                        console.log(response.data)
                        $scope.gotoNextState(response.data);
                      },
                      $log.error)
                }, $log.error);
          };

          $scope.init = function () {
            $log.info("Loading PayController");

            var payUri = uriMapper.fromSitePath($location.path(), '/orders/order/pay/a/');
            $log.debug($location.path() + ' -> ' + payUri);
            $http(
                {
                  method: 'GET',
                  url: payUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {

                  $scope.pay = response.data;

                }, $log.error);
          };

          $scope.init();
        }
      ]);
});