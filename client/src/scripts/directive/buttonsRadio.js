define(['../controller/controllersModule'], function (controllers) {

  controllers.directive('buttonsRadio', function () {
    return {
      restrict: 'E',
      scope: { model: '=', options: '@'},
      controller: ['$scope', function ($scope) {
        $scope.activate = function (option) {
          $scope.model = option;
        };
      }],
      link: function (scope, element, attrs) {
        // space delimited string - for now will do
        scope.values = attrs.options.split(' ');
      },
      template: "<button type='button' class='btn' " +
        "ng-class='{active: option == model}'" +
        "ng-repeat='option in options=values' " +
        "ng-click='activate(option)'>{{option|inflector:'humanize'}}" +
        "</button>"
    };
  })

});