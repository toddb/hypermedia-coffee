define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';

  return controllers.controller(
      'OrdersController',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', '$timeout', 'link',
        function OrdersController($scope, $log, $location, $http, uriMapper, $timeout, link) {

          /**
           *
           * @param {Array} array
           * @param newValue
           */
          function updateObjectByUri(array, newValue) {
            if (_(array).isArray()) {
              var self = link.getUrl(newValue, /self|canonical/);
              for (var index = 0; index < array.length; ++index) {
                if (self == link.getUrl(array[index], /self|canonical/)) {
                  array.splice(index, 1, newValue);
                  return;
                }
              }
            }
          }

          function clearOrders() {
            // Clear the array, but do not delete it as it is bound to UI
            $scope.orders.splice(0, $scope.orders.length);
          }

          function addOrder(item) {
            $scope.orders.push(item);
          }

          function updateOrder(item) {
            updateObjectByUri($scope.orders, item);
          }

          $scope.gotoOrder = function gotoOrder(order) {
            var self = link.getUrl(order, /self|canonical/);
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
            $log.info("Loading OrdersController (Orders)");
            $scope.orders = [];

            var apiUri = uriMapper.fromSitePath($location.path(), '/orders/a/');
            $http(
                {
                  method: 'GET',
                  url: apiUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {
                  _(response.data.items).each(function (item) {
                    addOrder(
                        {
                          links: [
                            {rel: 'self', href: item.id}
                          ],
                          type: item.title
                        });

                    // Get the order
                    $http({
                      method: 'GET',
                      url: item.id,
                      headers: {Accept: 'application/json'}
                    }).then(function (response) {
                      updateOrder(response.data);
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