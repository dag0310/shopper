angular.module('shopper.list', [])
.controller('ListCtrl', function($scope, ListService) {
  $scope.$on('showListDetail', function(scope, list) {
    $scope.showMe = true;
    $scope.list = list;
  });
  
  $scope.cancel = function() {
    $scope.showMe = false;
    $scope.list = null;
  };
  
  $scope.updateList = function() {
    ListService.updateList($scope.list.id, $scope.list.name);
    $scope.cancel();
  };
  
  $scope.showMe = false;
  $scope.list = null;
})
.service('ListService', function($http, $rootScope, Api, Session) {
  this.updateList = function(list_id, name) {
    var params = Api.getParams();
    params.cmd = 'update_list';
    params.list_id = list_id;
    params.name = name;
    $http.get(Api.url, { params: params });
  };
})
;
