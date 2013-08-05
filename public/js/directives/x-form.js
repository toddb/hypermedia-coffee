define(['../controllers/module'], function (module) {

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
//    /* This is what the implementation should be */
//    angular.forEach(['create', 'delete', 'edit'], function (media) {
//      module.directive(media + 'Form', function () {
//        return {
//          restrict: 'AE',
//          scope: 'isolate',
//          replace: true,
//          controller: ['$scope', 'link', function ($scope, link) {
//            $scope.getForm = function () {
//              return link.getUrl(this, media + '-form', 'text/html')
//            }
//          }],
//          template: "<span ng-include=\"getForm()\"></span>"
//        }
//      })
//    });

});