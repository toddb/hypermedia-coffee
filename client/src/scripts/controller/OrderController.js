define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';


  return controllers.controller(
      'OrderController',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', 'link', '$timeout',
        function OrderController($scope, $log, $location, $http, uriMapper, link, $timeout) {


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

          function updateItem(item) {
            updateObjectByUri($scope.items, item);
          }

          function removeItem(item) {
            removeObjectByUri($scope.items, item);
          }

          $scope.gotoNextState = function gotoNextState() {
            var self = link.getUrl($scope.items, /pay/);
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
          } ;

          $scope.pay = function(item){
            $log.debug("Pay : not implemented");

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
            $scope.items = [];

            var orderUri = uriMapper.fromSitePath($location.path(), '/orders/order/a/');
            $log.debug($location.path() + ' -> ' + orderUri);
            $http(
                {
                  method: 'GET',
                  url: orderUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {

                  $scope.order = response.data;

                  _(response.data.items).each(function (item) {
                    addItem(
                        {
                          links: [
                            {rel: 'self', href: item.id}
                          ],
                          type: item.title || ''
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