define(['../controller/controllersModule'], function (module) {

  angular.forEach({post: 'create', 'delete': 'delete', put: 'edit'}, function (media, key) {
    module.directive(media + 'Form', function () {
      return {
        restrict: 'A',
        scope: 'isolate',
        replace: false,
        controller: ['$scope', function ($scope) {
          $scope.getForm = function (key) {
            return $scope.path + key + '.' + $scope.type;
          }
        }],
        link: function(scope, elem, attrs){
          // for now default rather than set on view or set as constant
          scope.path = attrs.path || '/templates/partials/order/';
          scope.type = attrs.type || 'html';
        },
        template: "<span ng-include=\"getForm('" + key + "')\"></span>"
      }
    })
  });

});