define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';


  return controllers.controller(
      'OrderController',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', 'link', '$timeout',
        function OrderController($scope, $log, $location, $http, uriMapper, link, $timeout) {

          $scope.order = {links: [], items: []};

          function addOrder(order) {
            // Need to bind to the reference inside the object
            $scope.order.links = order.links;
            $scope.order.items = order.items;
          }

          function addItem(item) {
            $scope.items.push(item);
          }

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

          /**
           *
           * @param {Array} array
           * @param oldValue
           */
          function removeObjectByUri(array, oldValue) {
            if (_(array).isArray()) {
              var self = link.getUrl(oldValue, /self|canonical/);
              for (var index = 0; index < array.length; ++index) {
                if (self == link.getUrl(array[index], /self|canonical/)) {
                  array.splice(index, 1);
                  return;
                }
              }
            }
          }

          function clearItems() {
            if (!$scope.items) {
              $scope.items = [];
            }
            // Clear the array, but do not delete it as it is bound to UI
            $scope.items.splice(0, $scope.items.length);
          }

          function updateItem(item) {
            updateObjectByUri($scope.items, item);
          }

          function removeItem(item) {
            removeObjectByUri($scope.items, item);
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

          $scope.delete = function (item) {
            link.delete(item, 'self')
                .then(function success() {
                  removeItem(item);
                  $log.info("Deleted")
                })
          }

          $scope.deleteAll = function () {
            $log.info("TBC")
          }

          $scope.create = function (item) {

            link.get($scope.order, 'create-form', 'application/json')
                .then(function success(response) {

                  link.post(response.data, 'self', 'application/json', item || {}).
                      then(function success(response) {
                        $http.get(response.headers().location, {
                          headers: {
                            'Accept': response.headers()['content-type']
                          }
                        })
                            .then(function success(response) {
                              addItem(response.data);
                            },
                            $log.error)
                      }, $log.error);

                }, $log.error);

          };

          $scope.init = function () {
            $log.info("Loading OrderController");
            clearItems();

            var orderUri = uriMapper.fromSitePath($location.path(), '/orders/order/a/');
            $http(
                {
                  method: 'GET',
                  url: orderUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {

                  addOrder(response.data);

                  _(response.data.items).each(function (item) {
                    addItem(
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
                      updateItem(response.data);
                    });

                  });

                }, $log.error);
          };

          $scope.init();
        }
      ]);
});