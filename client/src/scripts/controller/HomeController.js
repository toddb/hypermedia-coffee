define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';

  function changeLocation(url, $location, $scope) {
    $scope = $scope || angular.element(document).scope();
    //this this if you want to change the URL and add it to the history stack
    $location.path(url);
    $scope.$apply();
  }

  return controllers.controller(
      'HomeController',
      [
        '$scope', '$log', '$location', 'UriMapper', 'link', '$state', '$stateParams', '$timeout', 'apiRoot', '$http',
        function HomeController($scope, $log, $location, uriMapper, link, $state, $stateParams, $timeout, apiRoot, $http) {

          function init() {
            setOrder();
            setOrders();
            $log.info("Loading HomeController");
          }

          function setOrder(order) {
            $scope.order = order || {};
          }

          function setOrders() {
            link.get(apiRoot.data, 'orders')
                .then(function success(response) {
                  $scope.orders = response.data;
                })
          }

          function makeStateUri(stateRelation, apiRepresentation, apiLinkRelation) {
            var apiUri = uriMapper.makeRelative(link.getUrl(apiRepresentation, apiLinkRelation));
            var href = $state.href($state.current.data.rel[stateRelation], {apiUri: apiUri});
            // see https://github.com/angular/angular.js/issues/1388
            href = href.replace('%252F', '/');
            return href;
          }

          $scope.create = function (item, attrs) {
            setOrder();
            link.post(apiRoot.data, 'orders', 'application/json', _.pick(item, attrs)).
                then(function success(response) {
                  $http.get(response.headers().location, {
                    headers: {
                      'Accept': response.headers()['content-type']
                    }
                  })
                      .then(function success(response) {
                        setOrder(response.data);
                        setOrders();
                      },
                      $log.error)
                }, $log.error);
          };

          $scope.ordersHref = function () {
            return makeStateUri('orders', apiRoot.data, 'orders');
          };

          init();
        }

      ]);
});