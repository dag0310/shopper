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
.controller('HomeCtrl', function($scope, $rootScope, $timeout, HomeService) {
  $scope.$on('updateAllProducts', function(scope, data) {
    $scope.allProducts = data;
  });
  
  $scope.$on('updateLists', function(scope, data) {
    $scope.lists = data;
  });
  
  $scope.$on('goToFirstList', function(scope) {
    if ($scope.currentListIndex > 0) {
      $scope.currentListIndex--;
    }
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
  
  $scope.isProductInList = function(product) {
    var currentList = $scope.lists[$scope.currentListIndex];
    if (currentList === undefined) {
      return false;
    }
    
    for (var i = 0; i < currentList.products.length; i++) {
      if (product.id === currentList.products[i].id) {
        return true;
      }
    }
    return false;
  };
  
  $scope.addProductToList = function(product) {
    var currentList = $scope.lists[$scope.currentListIndex];
    if ($scope.isProductInList(product)) {
      return;
    }
    
    HomeService.addProductToList(product, currentList).then(function() {
      currentList.products.push(product);
    });
    
    $scope.productSearchQuery = '';
  };
  
  $scope.removeProductFromList = function(product) {
    var currentList = $scope.lists[$scope.currentListIndex];
    HomeService.removeProductFromList(product, currentList);
    currentList.products.splice(currentList.products.indexOf(product), 1);
  };
  
  $scope.addList = function() {
    var name = prompt('What should we call it?');
    if (name) {
      HomeService.addList(name).success(function(data) {
        HomeService.getListsWithProductsOfUser().success(function() {
          $timeout(function() {
            $scope.currentListIndex = $scope.lists.length - 1;
          }, 500);
        });
      });
    }
  };
  
  $scope.editList = function(index) {
    $rootScope.$broadcast('showListDetail', $scope.lists[index]);
  };
  
  $scope.lists = [];
  $scope.currentListIndex = 0;
  $scope.refresh();
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
    
    return $http.get(Api.url, { params: params }).success(function(data) {
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
  
  this.addList = function(name) {
    var params = Api.getParams();
    params.cmd = 'add_list';
    params.name = name;
    params.user_id = Session.user.id;
    return $http.get(Api.url, { params: params });
  };
})
;
