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
  HomeService.getListsWithProductsOfUser();
  HomeService.getAllProducts();
  
  $scope.lists = [];
  $scope.currentListIndex = 0;
  
  $scope.$on('updateAllProducts', function(evt, data) {
    $scope.allProducts = data;
  });
  
  $scope.$on('updateLists', function(evt, data) {
    $scope.lists = data;
  });
  
  $scope.refresh = function() {
    HomeService.getAllProducts();
    HomeService.getListsWithProductsOfUser();
  };
  
  $scope.addCustomProductToList = function() {
    var name = $scope.productSearchQuery;
    
    HomeService.addCustomProductToList(name, $scope.lists[$scope.currentListIndex]).success(function(data) {
      $scope.refresh();
    });
    
    $scope.productSearchQuery = '';
  };
  
  $scope.isProductInList = function(product, list) {
    for (var i = 0; i < list.products.length; i++) {
      if (product.id === list.products[i].id) {
        return true;
      }
    }
    return false;
  };
  
  $scope.addProductToList = function(product) {
    var currentList = $scope.lists[$scope.currentListIndex];
    if ($scope.isProductInList(product, currentList)) {
      return;
    }
    
    HomeService.addProductToList(product, currentList).success(function(data) {
//      console.log(data);
    });
    if (currentList.length === 0) {
      currentList.products = [];
    }
    currentList.products.push(product);
    
    $scope.productSearchQuery = '';
  };
  
  $scope.removeProductFromList = function(product) {
    var currentList = $scope.lists[$scope.currentListIndex];
    HomeService.removeProductFromList(product, currentList).success(function(data) {
//      console.log(data);
    });
    
    currentList.products.splice(currentList.products.indexOf(product), 1);
  };
})
.service('HomeService', function($http, $rootScope, Api, Session) {
  this.getAllProducts = function() {
    var params = Api.getParams();
    params.cmd = 'get_all_products';
    params.user_id = Session.user.id;
    
    $http.get(Api.url, { params: params }).success(function(data) {
      $rootScope.$broadcast('updateAllProducts', data);
    });
  };
  
  this.getListsWithProductsOfUser = function() {
    var params = Api.getParams();
    params.cmd = 'get_lists_with_products_of_user';
    params.user_id = Session.user.id;
    
    $http.get(Api.url, { params: params }).success(function(data) {
      $rootScope.$broadcast('updateLists', data);
    });
  };
  
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
