define(['angular', 'underscore', './controllersModule'], function (angular, _, controllers) {
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

  return controllers
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
              templateUrl: "template/pay/post.html", // TODO: should get from links
              controller: PayDialogController,
              resolve: { item: $scope.model }
            };

            var d = $dialog.dialog(opts);

            $scope.pay = function (item) {
              d.open().
                  then(function (token) {
                    $log.log("adfdf")
                    link.post(item, 'pay', 'application/json', token).
                        then(function success(response) {
                          $log.log("Payment done: %s", response.headers('location'));
                          link.get(item, {self: 'viewstate'}, 'application/json').
                              then(function success(response) {
                                _.extend(item, response.data);
                              });
                          d.close();
                        },
                        function error(response) {
                          $log.log("Payments: " + response.data);  //TODO - implement server!
                          link.get(item, {self: 'viewstate'}, 'application/json').
                              then(function success(response) {
                                _.extend(item, response.data);
                              });
                          d.close();
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