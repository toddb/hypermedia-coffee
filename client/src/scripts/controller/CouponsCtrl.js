define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';

  return controllers.controller(
      'CouponsCtrl',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', '$timeout', 'link',
        function CouponCtrl($scope, $log, $location, $http, uriMapper, $timeout, link) {

          /**
           *
           * @param {Array} array
           * @param newValue
           */
          function updateObjectByUri(array, newValue) {
            if (_(array).isArray()) {
              var self = link.getUrl(newValue, /self|canonical/);
              for (var index = 0; index < array.length; ++index) {
                if (self === link.getUrl(array[index], /self|canonical/)) {
                  array.splice(index, 1, newValue);
                  return;
                }
              }
            }
          }

          function clearCoupons() {
            // Clear the array, but do no delete it as it is bound to UI
            $scope.coupons.splice(0, $scope.coupons.length);
          }

          function addCoupon(category) {
            $scope.coupons.push(category);
          }


          function updateCoupon(item) {
            updateObjectByUri($scope.coupons, item);
          }

          $scope.gotoCoupon = function gotoCoupon(coupon) {
            var self = link.getUrl(coupon, /self|canonical/);
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

          $scope.init = function () {
            $log.info("Loading OrdersController (Coupons)");
            $scope.coupons = [];

            var apiUri = uriMapper.fromSitePath($location.path(), '/orders/a/');
            $http(
                {
                  method: 'GET',
                  url: apiUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {
                  _(response.data.items).each(function (item) {
                    addCoupon(
                        {
                          links: [
                            {rel: 'self', href: item.id}
                          ],
                          name: item.title
                        });

                    // Get the coupon
                    $http({
                      method: 'GET',
                      url: item.id,
                      headers: {Accept: 'application/json'}
                    }).then(function (response) {
                      updateCoupon(response.data);
                    });

                  });
                },
                  $log.error
                );
          };


          $scope.init();
        }
      ]);
});