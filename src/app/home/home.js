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
.controller('HomeCtrl', function($scope, $rootScope, $timeout, $translate, HomeService) {
    $scope.$on('bodyClicked', function(scope) {
        $scope.productSearchQuery = '';
    });
    
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
    
    $scope.$on('hideListDetail', function(scope) {
        $scope.showMe = true;
    });

    $scope.$watch('currentListIndex', function(newValue) {
        if ($scope.lists[newValue]) {
            localStorage.lastListId = $scope.lists[newValue].id;
        }
    });

    $scope.refresh = function(initialLoad) {
        var allProductsSorted = [];
        var allProductsClean = JSON.parse(angular.toJson($scope.allProducts));
        for (var i = 0; i < allProductsClean.length; i++) {
            var arrayOfSortedKeyValues = [];
            var keys = Object.keys(allProductsClean[i]).sort();
            for (var j = 0; j < keys.length; j++) {
                arrayOfSortedKeyValues.push(allProductsClean[i][keys[j]]);
            }
            allProductsSorted.push(arrayOfSortedKeyValues);
        }
        var allProductsSortedJsonString = JSON.stringify(allProductsSorted);
        HomeService.getAllProducts(SparkMD5.hash(allProductsSortedJsonString));
        
        var listsClean = JSON.parse(angular.toJson($scope.lists));
        var listsStringified = JSON.stringify(listsClean);
        HomeService.getListsWithProductsOfUser(SparkMD5.hash(listsStringified)).then(function() {
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
        
        $timeout(function() {
            $scope.refresh();
        }, 1500);
    };

    $scope.addCustomProductToList = function(name) {
        HomeService.addCustomProductToList($scope.capitalizeString(name), $scope.lists[$scope.currentListIndex]).success(function(data) {
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
        $translate('WHAT_SHOULD_WE_CALL_IT').then(function(translation) {
            var name = prompt(translation);
            if (! name)
                return;
            HomeService.addList(name).success(function(data) {
                HomeService.getListsWithProductsOfUser().success(function() {
                    $timeout(function() {
                        $scope.currentListIndex = $scope.lists.length - 1;
                    });
                });
            });
        });
        
    };

    $scope.editList = function(index) {
        $scope.showMe = false;
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
    
    $scope.capitalizeString = function(str) {
        if (typeof str === 'string') {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        return '';
    };

    function getCurrentList() {
        return $scope.lists[$scope.currentListIndex];
    }

    $scope.showMe = true;
    $scope.lists = [];
    $scope.allProducts = [];
    $scope.currentListIndex = 0;
    $scope.refresh(true);
})
.service('HomeService', function($http, $rootScope, Api, Session) {
    this.getAllProducts = function(hash) {
        var params = Api.getParams();
        params.cmd = 'get_all_products';
        params.user_id = Session.user.id;
        params.hash = hash;

        $http.get(Api.url, { params: params }).success(function(data) {
            if (data !== 'null')
                $rootScope.$broadcast('updateAllProducts', data);
        });
    };

    this.getListsWithProductsOfUser = function(hash) {
        var params = Api.getParams();
        params.cmd = 'get_lists_with_products_of_user';
        params.user_id = Session.user.id;
        params.hash = hash;

        return $http.get(Api.url, { params: params }).success(function(data) {
            if (data !== 'null')
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
.filter('productsFilter', function () {
    function fetchComment(query, pattern) {
        if (query.indexOf(' ' + pattern) !== -1)
            pattern = ' ' + pattern;
        return query.replace(pattern, '');
    }
    
    return function(items, query) {
        if (query === undefined || query === '')
            return items;
        
        var i, j, filteredItems = [];
        query = query.toLowerCase();
        
        for (i = 0; i < items.length; i++) {
            var itemName = items[i].name.toLowerCase();
            
            if (query.indexOf(itemName) !== -1) {
                items[i].comment = fetchComment(query, itemName);
                filteredItems.push(items[i]);
                continue;
            }
            
            var queryTokens = query.split(' ');
            for (j = 1; j <= queryTokens.length; j++) {
                var pattern = queryTokens.slice(-j).join(' ');
                if (itemName.startsWith(pattern)) {
                    items[i].comment = fetchComment(query, pattern);
                    filteredItems.push(items[i]);
                    break;
                }
            }
        }
        
        return filteredItems;
    };
})
;
