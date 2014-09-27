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
    
  $scope.$watch('currentListIndex', function(newValue) {
    if ($scope.lists[newValue]) {
      localStorage.lastListId = $scope.lists[newValue].id;
    }
  });
  
  $scope.refresh = function(initialLoad) {
    HomeService.getAllProducts();
    HomeService.getListsWithProductsOfUser().then(function() {
        if (initialLoad) {
          $timeout(function() {
            if (localStorage.lastListId) {
                for (var i = 0; i < $scope.lists.length; i++) {
                    if ($scope.lists[i].id.toString() === localStorage.lastListId) {
                        $scope.currentListIndex = i;
                        break;
                    }
                }
            }
          });
        }
    });
  };
  
  $scope.addCustomProductToList = function() {
    var name = $scope.productSearchQuery;
    
    HomeService.addCustomProductToList(name, $scope.lists[$scope.currentListIndex]).success(function(data) {
      $scope.refresh();
    });
    
    $scope.productSearchQuery = '';
  };
  
  $scope.isProductInList = function(product) {
    if (getCurrentList() === undefined) {
      return false;
    }
    
    for (var i = 0; i < getCurrentList().products.length; i++) {
      if (product.id === getCurrentList().products[i].id) {
        return true;
      }
    }
    return false;
  };
  
  $scope.addProductToList = function(product) {
    if ($scope.isProductInList(product)) {
      return;
    }
    
    HomeService.addProductToList(product, getCurrentList()).then(function() {
      getCurrentList().products.push(product);
    });
    
    $scope.productSearchQuery = '';
  };
  
  $scope.removeProductFromList = function(product) {
    HomeService.removeProductFromList(product, getCurrentList());
    getCurrentList().products.splice(getCurrentList().products.indexOf(product), 1);
  };
  
  $scope.addList = function() {
    var name = prompt('What should we call it?');
    if (name) {
      HomeService.addList(name).success(function(data) {
        HomeService.getListsWithProductsOfUser().success(function() {
          $timeout(function() {
            $scope.currentListIndex = $scope.lists.length - 1;
          });
        });
      });
    }
  };
  
  $scope.editList = function(index) {
    $rootScope.$broadcast('showListDetail', $scope.lists[index]);
  };
  
  $scope.moveListOnePosition = function(direction) {
      var currentListIndex = $scope.currentListIndex;
      var otherListIndex = $scope.currentListIndex + direction;
      
      if (otherListIndex < 0 || otherListIndex > $scope.lists.length - 1) {
          return;
      }
      
      $timeout(function() {
        $scope.currentListIndex = otherListIndex;
      });
      var otherList = $scope.lists[otherListIndex];
      $scope.lists[otherListIndex] = $scope.lists[currentListIndex];
      $scope.lists[currentListIndex] = otherList;
      
      HomeService.moveListOnePosition($scope.lists[otherListIndex].id, direction);
  };
  
  function getCurrentList() {
      return $scope.lists[$scope.currentListIndex];
  }
  
  $scope.lists = [];
  $scope.currentListIndex = 0;
  $scope.refresh(true);
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
  
  this.moveListOnePosition = function(list_id, direction) {
      var params = Api.getParams();
      params.cmd = 'move_list_one_position';
      params.list_id = list_id;
      params.direction = direction;
      params.user_id = Session.user.id;
      return $http.get(Api.url, { params: params });
  };
})
;
