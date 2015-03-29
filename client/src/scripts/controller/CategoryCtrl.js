define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
  'use strict';


  return controllers.controller(
      'CategoryCtrl',
      [
        '$scope', '$log', '$location', '$http', 'UriMapper', '$timeout', 'link',
        function CategoryCtrl($scope, $log, $location, $http, uriMapper, $timeout, link) {

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


          function clearCategorys() {
            // Clear the array, but do no delete it as it is bound to UI
            $scope.categories.splice(0, $scope.categories.length);
          }

          function addCategory(category) {
            $scope.categories.push(category);
          }


          function updateCategory(item) {
            updateObjectByUri($scope.categories, item);
          }

          $scope.gotoCategory = function gotoCategory(category) {
            var self = link.getUrl(category, /self|canonical/);
            if (self) {
              var path = uriMapper.toSitePath(self, '/category/');
              $log.debug(self + ' -> ' + path);

              $timeout(function () {
                $location.path(path);
              });
            } else {
              $log.error('Category has no identity');
            }
          };

          $scope.init = function () {
            $log.info("Loading CategoryCtrl");
            $scope.categories = [];

            var apiUri = uriMapper.fromSitePath($location.path(), '/categories');
            $http(
                {
                  method: 'GET',
                  url: apiUri,
                  headers: {Accept: 'application/json'}
                })
                .then(function success(response) {
                  _(response.data.items).each(function (item) {
                    addCategory(
                        {
                          links: [
                            {rel: 'self', href: item.id}
                          ],
                          description: item.title
                        });

                    // Get the category
                    $http({
                      method: 'GET',
                      url: item.id,
                      headers: {Accept: 'application/json'}
                    }).then(function (response) {
                      updateCategory(response.data);
                    });

                  });

                }, function error(msg) {
                  $log.error(msg);
                });
          };


          $scope.init();
        }
      ]);
});