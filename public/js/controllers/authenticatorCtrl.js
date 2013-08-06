define(['services/httpAuthInterceptor'], function () {

  'use strict';

  function LoginDialogCtrl($scope, dialog) {

    $scope.post = function () {
      // TODO: scrape the form inputs rather than hardcode
      dialog.close({username: $scope.username, password: $scope.password});
    };
  }

  function AuthenticatorCtrl($scope, $dialog, $log, authService, link) {

    $scope.collection;
    $scope.items;

    $scope.opts = {
      backdrop: true,
      keyboard: false,
      backdropClick: false,
      templateUrl: "/templates/partials/authenticator/post.html", // TODO: should get from links
      controller: 'LoginDialogCtrl'
    };

    var d = $dialog.dialog($scope.opts);

    $scope.$on('event:auth-loginRequired', function () {
      d.open().
        then(function (item) {
          if (angular.isDefined(item)) {
            link.post($scope.collection, 'self', 'application/json', item).
              then(function success(response) {
                $scope.items = [response.data];
                authService.loginConfirmed();
              },
              function error() {
                $log.log("Authentication failed", arguments)
              })
          }
        });
    });
    $scope.$on('event:auth-loginConfirmed', function () {
      d.close();
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
          $log.warn("Authenticator not found");
        });
    }

    $scope.delete = function (item) {
      item = item || this.item;
      link.del(item).
        then(function () {
          $scope.items = []; // TODO: manage properly
        });
    };

    $scope.get();

  }

  return angular.module('authenticator', ['http-auth-interceptor', 'app.services'])
    .controller('LoginDialogCtrl', ['$scope', 'dialog', LoginDialogCtrl])
    .controller('AuthenticatorCtrl', ['$scope', '$dialog', '$log', 'authService', 'Resource', AuthenticatorCtrl])
    .directive('authenticator', function () {
      return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
        },
        template: "<span ng-controller='AuthenticatorCtrl' ng-include=\"'/templates/partials/authenticator/get.html'\"></span>"
      }
    })
    .filter('isEmpty', function () {
      return function (array) {
        if (angular.isUndefined(array)) return true;
        return (angular.isArray(array) ? array.length : array.size) != 0;
      }
    });

});