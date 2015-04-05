define(['angular', 'underscore', './controllersModule', '../provider/httpAuthInterceptor'], function (angular, _, controllers) {
  'use strict';

  var open = false;

  function LoginModalInstance($scope, $modalInstance, $log) {

    $scope.post = function (username, password) {
      var credentials = {username: username, password: password};
      $modalInstance.close(credentials);
      $log.debug("Login dialog closed")
    };
  }

  function AuthenticatorController($scope, $modal, $log, authService, link, $http) {

    $log.info("Loading AuthenticatorController");

    function clearItems() {
      // Clear the array, but do not delete it as it is bound to UI
      $scope.items.splice(0, $scope.items.length);
    }

    $scope.collection = [];  // apiCollection
    $scope.items = [];       // sessionItems

    var opts = {
      backdrop: true,
      keyboard: false,
      backdropClick: false,
      templateUrl: "./template/authenticator/post.html",
      controller: 'LoginModalInstance'
    };

    var loginModal;

    $scope.$on('event:auth-loginRequired', function () {
      if (open) return;
      open = true;
      $log.debug("Login dialog opening");
      loginModal = $modal.open(opts)
          .result
          .then(function (credentials) {
            if (angular.isDefined(credentials)) {
              link.post($scope.collection, 'authenticator', 'application/json', credentials)
                  .then(function success(response) {
                    $http.get(response.headers().location)
                        .then(function success(response) {
                          $scope.items = [response.data];
                          authService.loginConfirmed();
                        },
                        function error() {
                          $log.warn("Authentication: failed", arguments)
                        });
                  },
                  function error() {
                    $log.warn("Authentication: failed", arguments)
                  })
            }
          }, function () {
            $log.debug("Authentication: complete")
            open = false;
          });
    });

    $scope.$on('event:auth-loginConfirmed', function () {
      $log.debug("Authentication: confirmed")
    });

    $scope.get = function () {
      link.get('HEAD', 'api').
          then(function success(response) {
            $scope.collection = response.data;
            link.get(response.data, 'authenticator')
                .then(function success(response) {
                  $http.get(_.last(response.data.items).id)
                      .then(function (response) {
                        $scope.items = [response.data];
                      });
                })
          }, function error() {
            $log.warn("Authenticator: not found - there is not link relation 'authenticator' on HEAD");
          });
    }

    $scope.delete = function (item) {
      item = item || this.item;
      link.del(item, 'self').
          then(function () {
            clearItems();
          });
    };

    $scope.get();

  }

  return controllers
      .controller('AuthenticatorController', ['$scope', '$modal', '$log', 'authService', 'link', '$http', AuthenticatorController])
      .controller('LoginModalInstance', ['$scope', '$modalInstance', '$log', LoginModalInstance])
      .directive('authenticator', function () {
        return {
          restrict: 'C',
          link: function (scope, elem, attrs) {
          },
          template: "<span ng-controller='AuthenticatorController' ng-include=\"'./template/authenticator/get.html'\"></span>"
        }
      });

});