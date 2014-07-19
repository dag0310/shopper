angular.module('shopper.home', [
  'ui.router'
])
.config(function config($stateProvider ) {
  $stateProvider.state('home', {
    url: '/home',
    views: {
      'main': {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    }
  });
})
.controller('HomeCtrl', function($scope, $rootScope, HomeService) {
  $scope.currentListIndex = 0;
  
  $scope.$on('updateAllProducts', function(evt, data) {
    $scope.allProducts = data;
  });
  
  $scope.$on('updateLists', function(evt, data) {
    $scope.lists = data;
  });
  
  $scope.addCustomProductToList = function() {
    HomeService.addCustomProductToList($scope.productSearchQuery, $scope.lists[$scope.currentListIndex]).success(function(data) {
//      console.log(data);
    });
    $scope.productSearchQuery = '';
  };
  
  $scope.addProductToList = function(product) {
    $scope.productSearchQuery = '';
    HomeService.addProductToList(product, $scope.lists[$scope.currentListIndex]).success(function(data) {
//      console.log(data);
    });
  };
  
  $scope.removeProductFromList = function(product) {
    HomeService.removeProductFromList(product, $scope.lists[$scope.currentListIndex]).success(function(data) {
//      console.log(data);
    });
  };
})
.service('HomeService', function($http, $rootScope, $interval, Api, Session) {
  var self = this;
  
  var promiseGetAllProducts = $interval(function() {
    self.getAllProducts();
  }, 1500); // 1500
  this.getAllProducts = function() {
    var params = Api.getParams();
    params.cmd = 'get_all_products';
    params.user_id = Session.user.id;
    
    return $http.get(Api.url, { params: params }).success(function(data) {
      $rootScope.$broadcast('updateAllProducts', data);
    });
  };
  self.getAllProducts();
  
  var promiseGetListProducts = $interval(function() {
    self.getListsWithProductsOfUser();
  }, 500); // 500
  this.getListsWithProductsOfUser = function() {
    var params = Api.getParams();
    params.cmd = 'get_lists_with_products_of_user';
    params.user_id = Session.user.id;
    
    $http.get(Api.url, { params: params }).success(function(data) {
      $rootScope.$broadcast('updateLists', data);
    });
  };
  self.getListsWithProductsOfUser();
  
  this.addProductToList = function(product, list) {
    var params = Api.getParams();
    params.cmd = 'add_product_to_list';
    params.product_id = product.id;
    params.list_id = list.id;
    return $http.get(Api.url, { params: params });
  };
  
  this.addCustomProductToList = function(name, list) {
    var params = Api.getParams();
    params.cmd = 'add_custom_product_to_list';
    params.name = name;
    params.list_id = list.id;
    params.user_id = Session.user.id;
    return $http.get(Api.url, { params: params });
  };
  
  this.removeProductFromList = function(product, list) {
    var params = Api.getParams();
    params.cmd = 'remove_product_from_list';
    params.product_id = product.id;
    params.list_id = list.id;
    return $http.get(Api.url, { params: params });
  };
})
;
