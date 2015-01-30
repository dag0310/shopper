angular.module('shopper.auth', [
    'ui.router'
])
.config(function config($stateProvider ) {
    $stateProvider.state('auth', {
        url: '/auth',
        views: {
            'main': {
                controller: 'AuthCtrl',
                templateUrl: 'auth/auth.tpl.html'
            }
        }
    });
})
.controller('AuthCtrl', function($scope, $location, $translate, AuthService, Session) {
    if (Session.isLoggedIn()) {
        $location.path('/home');
    }

    $scope.email = '';
    $scope.rememberMe = true;
    $scope.authButtonText = 
    $scope.emailInvalid = false;
    $scope.passwordInvalid = false;
    $translate(['LOGIN', 'REGISTER']).then(function(translations) {
        $scope.loginStr = translations.LOGIN;
        $scope.registerStr = translations.REGISTER;
        $scope.authButtonText = $scope.loginStr + ' / ' + $scope.registerStr;
    });

    $scope.refreshButtonText = function() {
        if ($scope.email && $scope.email.trim() !== '') {
            $scope.emailInvalid = false;
            AuthService.checkIfLoginExists($scope.email).success(function(data) {
                $scope.authButtonText = data.result ? $scope.loginStr : $scope.registerStr;
            });
        } else {
            $scope.emailInvalid = true;
        }
    };

    $scope.performLogin = function() {
        AuthService.checkIfLoginExists($scope.email).success(function(data) {
            if (data.result) {
                AuthService.checkIfLoginIsValid($scope.email, $scope.password).success(function(data) {
                    if (data.result) {
                        $scope.passwordInvalid = false;
                        AuthService.getUserByEmail($scope.email).success(function(user) {
                            if ($scope.rememberMe) {
                                localStorage.user = JSON.stringify(user);
                            }
                            Session.login(user);
                            $location.path('/home');
                        });
                    } else {
                        $scope.passwordInvalid = true;
                        $scope.password = '';
                    }
                });
            } else {
                AuthService.registerUser($scope.email, $scope.password, $scope.name).success(function(data) {
                    if (data.result) {
                        $scope.performLogin();
                    } else {
                        $translate('REGISTRATION_FAILED').then(function(translation) {
                            alert(translation + '! :(');
                        });
                    }
                });
            }
        });
    };
})
.service('AuthService', function($http, Api) {
    this.checkIfLoginExists = function(email) {
        var params = Api.getParams();
        params.cmd = 'login_exists';
        params.email = email;
        return $http.get(Api.url, { params: params });
    };

    this.checkIfLoginIsValid = function(email, password) {
        var params = Api.getParams();
        params.cmd = 'is_login_valid';
        params.email = email;
        params.password = password;
        return $http.get(Api.url, { params: params });
    };

    this.registerUser = function(email, password, name) {
        var params = Api.getParams();
        params.cmd = 'register_user';
        params.email = email;
        params.password = password;
        params.name = name;
        return $http.get(Api.url, { params: params });
    };

    this.getUserByEmail = function(email) {
        var params = Api.getParams();
        params.cmd = 'get_user_by_email';
        params.email = email;
        return $http.get(Api.url, { params: params });
    };
})
;
