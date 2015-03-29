define(['angular', 'underscore', './controllersModule', '../provider/httpAuthInterceptor'], function (angular, _, controllers) {
  'use strict';

  function LoginModalInstance($scope, $modalInstance, $log) {

    $scope.post = function (username, password) {
      var credentials = {username: username, password: password};
      $modalInstance.close(credentials);
      $log.debug("Login dialog closed")
    };
  }

  function AuthenticatorController($scope, $modal, $log, authService, link, $http) {

    $log.info("Loading AuthenticatorController");

    $scope.collection = [];
    $scope.items = [];

    var opts = {
      backdrop: true,
      keyboard: false,
      backdropClick: false,
      templateUrl: "./scripts/template/authenticator/post.html", // TODO: should get from links
      controller: 'LoginModalInstance'
    };

    var loginModal;

    $scope.$on('event:auth-loginRequired', function () {
      $log.debug("Login dialog opening");
      loginModal = $modal.open(opts)
          .result
          .then(function (credentials) {
            if (angular.isDefined(credentials)) {
              link
                  .post($scope.collection, 'self', 'application/json', credentials)
                  .then(function success(response) {
                    $http.get(response.headers().location, {
                      headers: {
                        'Accept': response.headers()['content-type']
                      }
                    })
                        .then(
                        function success(response) {
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
          });
    });

    $scope.$on('event:auth-loginConfirmed', function () {
      $log.debug("Authentication: confirmed")
    });

    $scope.get = function () {
      link.get('HEAD', 'authenticator').
          then(function success(response) {
            $scope.collection = response.data;
            link.get(response.data, 'last').
                then(function (response) {
                  $scope.items = [response.data];
                });
          }, function error() {
            $log.warn("Authenticator: not found - there is not link relation 'authenticator' on HEAD");
          });
    }

    $scope.delete = function (item) {
      item = item || this.item;
      link.del(item, 'self').
          then(function () {
            $scope.items = []; // TODO: manage properly
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
          template: "<span ng-controller='AuthenticatorController' ng-include=\"'./scripts/template/authenticator/get.html'\"></span>"
        }
      });

});