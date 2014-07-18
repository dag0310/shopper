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
  $rootScope.lists = [
  {
    id: 1,
    name: 'Einkaufsliste'
  },
  {
    id: 2,
    name: 'Test'
  },
  {
    id: 3,
    name: 'Abc'
  }
  ];
  
  $rootScope.currentList = $rootScope.lists[0];
  
  $scope.selectList = function() {
    HomeService.currentList = $rootScope.currentList;
  };
  
  $scope.$on('updateAllProducts', function(evt, data) {
    $scope.allProducts = data;
  });
  
  $scope.$on('updateListProducts', function(evt, data) {
    $scope.listProducts = data;
  });
  
  $scope.addProductToList = function(product) {
    HomeService.currentList = $rootScope.lists[1];
    HomeService.addProductToList(product, $scope.currentList).success(function(data) {
      console.log(data);
    });
  };
  
  $scope.removeProductFromList = function(product) {
    HomeService.removeProductFromList(product, $scope.currentList).success(function(data) {
      console.log(data);
    });
  };
})
.service('HomeService', function($http, $rootScope, $interval, Api) {
  var self = this;

  this.currentList = undefined;
  
  var promiseGetAllProducts = $interval(function() {
    self.getAllProducts();
  }, 1500);
  this.getAllProducts = function() {
    var params = Api.getParams();
    params.cmd = 'get_all_products';
    
    return $http.get(Api.url, { params: params }).success(function(data) {
      $rootScope.$broadcast('updateAllProducts', data);
    });
  };
  self.getAllProducts();
  
  var promiseGetListProducts = $interval(function() {
    self.getListProducts();
  }, 300);
  this.getListProducts = function() {
    var currentList = self.currentList;
    var params = Api.getParams();
    params.cmd = 'get_products_on_list';
    
    if (currentList !== undefined) {
      params.list_id = currentList.id;
      $http.get(Api.url, { params: params }).success(function(data) {
        $rootScope.$broadcast('updateListProducts', data);
      });
    }
  };
  self.getListProducts();
  
  this.addProductToList = function(product, list) {
    var params = Api.getParams();
    params.cmd = 'add_product_to_list';
    params.product_id = product.id;
    params.list_id = list.id;
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
