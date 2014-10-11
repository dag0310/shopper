angular.module('shopper.list', [])
.controller('ListCtrl', function($scope, $rootScope, ListService, HomeService, Session) {
    $scope.$on('showListDetail', function(scope, list) {
        $scope.showMe = ! $scope.showMe;
        if ($scope.showMe) {
            $scope.list = list;
        }
    });

    $scope.cancel = function() {
        $scope.showMe = false;
        $scope.userSelected = undefined;
        $scope.list = null;
        $rootScope.$broadcast('hideListDetail');
    };

    $scope.updateList = function() {
        ListService.updateList($scope.list.id, $scope.list.name);
        $scope.cancel();
    };

    $scope.searchUsers = function(query) {
        return ListService.searchUsers(query).then(function(users) {
            var usersFormatted = [];
            var listUserIds = [];
            for (var i = 0; i < $scope.list.users.length; i++) {
                listUserIds.push($scope.list.users[i].id);
            }

            angular.forEach(users.data, function(user) {
                if (
                    typeof user.name === 'string' && 
                    typeof user.email === 'string' &&
                    user.id !== Session.user.id &&
                    listUserIds.indexOf(user.id) === -1) {
                    usersFormatted.push(user);
                }
            });
            return usersFormatted;
        });
    };

    $scope.addUserToList = function() {
        if ($scope.userSelected && $scope.list) {
            ListService.addUserToList($scope.userSelected, $scope.list).success(function() {
                HomeService.getListsWithProductsOfUser();
            });
            $scope.cancel();
        }
    };

    $scope.unsubscribe = function() {
        if (confirm('Are you sure you want to unsubscribe from this list?!')) {
            ListService.unsubscribeUserFromList(Session.user, $scope.list).success(function() {
                HomeService.getListsWithProductsOfUser().success(function() {
                    $rootScope.$broadcast('goToFirstList');
                });
            });
            $scope.cancel();
        }
    };

    $scope.showMe = false;
    $scope.list = null;
})
.service('ListService', function($http, Api) {
    this.updateList = function(list_id, name) {
        var params = Api.getParams();
        params.cmd = 'update_list';
        params.list_id = list_id;
        params.name = name;
        $http.get(Api.url, { params: params });
    };

    this.searchUsers = function(query) {
        var params = Api.getParams();
        params.cmd = 'search_users';
        params.query = query;
        return $http.get(Api.url, { params: params });
    };

    this.addUserToList = function(user, list) {
        var params = Api.getParams();
        params.cmd = 'add_user_to_list';
        params.user_id = user.id;
        params.list_id = list.id;
        return $http.get(Api.url, { params: params });
    };

    this.unsubscribeUserFromList = function(user, list) {
        var params = Api.getParams();
        params.cmd = 'unsubscribe_user_from_list';
        params.user_id = user.id;
        params.list_id = list.id;
        return $http.get(Api.url, { params: params });
    };
})
;
