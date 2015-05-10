define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';


  return controllers.controller(
      'PickupController',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', 'link', '$timeout',
        function PickupController($scope, $log, $location, $http, uriMapper, link, $timeout) {


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

          function makeStateUri(stateRelation, apiRepresentation, apiLinkRelation) {
            var apiUri = uriMapper.makeRelative(link.getUrl(apiRepresentation, apiLinkRelation));
            var href = $state.href($state.current.data.rel[stateRelation], {apiUri: apiUri});
            // see https://github.com/angular/angular.js/issues/1388
            href = href.replace('%252F', '/');
            console.log(href)
            return href;
          }

          function updateItem(item) {
            updateObjectByUri($scope.items, item);
          }

          $scope.gotoNextState = function () {
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

          $scope.home = function () {

            $timeout(function () {
              $location.path('home');
            });

          };

          $scope.loadOrder = function () {
            var orderUri = uriMapper.fromSitePath($location.path(), '/orders/order/pickup/a/');
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
          }

          $scope.init = function () {
            $log.info("Loading PickupController");
            $scope.items = [];
            $scope.loadOrder();

          };

          $scope.init();
        }
      ]);
});