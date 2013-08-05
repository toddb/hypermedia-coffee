define(['controllers/module', 'underscore'], function (module, _) {

  'use strict';

  function PayDialogController($scope, dialog, item) {
    $scope.item = item;
    $scope.token = "34546456dsaffw";
    $scope.post = function () {
      dialog.close({token: $scope.token});
    };
    $scope.close = function () {
      dialog.close();
    };
  }

  return module
    .directive('pay', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: { model: '='},
        template: "<button class='btn btn-success' ng-show='hasRel(model)' ng-click='pay(model)'>Pay</button>",
        controller: ['$scope', '$dialog', '$log', 'Resource', function ($scope, $dialog, $log, link) {

          var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: false,
            templateUrl: "templates/partials/pay/post.html", // TODO: should get from links
            controller: PayDialogController,
            resolve: { item: $scope.model }
          };

          var d = $dialog.dialog(opts);

          $scope.pay = function (item) {
            d.open().
              then(function (token) {
                link.post(item, 'pay', 'application/json', token).
                  then(function success(response) {
                    $log.log("Payment done: %s", response.headers('location'));
                    link.get(item, {self: 'viewstate'}).
                      then(function success(response) {
                        _.extend(item, response.data);
                      });
                    d.close();
                  },
                  function error() {
                    $log.log("Payment failed - no token", arguments)
                  })
              });
          };

          $scope.hasRel = function (item) {
            return link.matches(item, 'pay');
          }
        }]
      }
    });
});