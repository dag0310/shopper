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
.controller('AuthCtrl', function($scope, $location, AuthService, Session) {
  var loginStr = 'Login', registerStr = 'Register';
  $scope.authButtonText = loginStr + ' / ' + registerStr;
  $scope.rememberMe = true;
  
  $scope.refreshButtonText = function() {
    AuthService.checkIfLoginExists($scope.email).success(function(data) {
      $scope.authButtonText = data.result ? loginStr : registerStr;
    });
  };
  
  $scope.performLogin = function() {
    AuthService.checkIfLoginExists($scope.email).success(function(data) {
      if (data.result) {
        AuthService.checkIfLoginIsValid($scope.email, $scope.password).success(function(data) {
          if (data.result) {
            if ($scope.rememberMe) {
              localStorage.email = $scope.email;
              localStorage.password = $scope.password;
            }
            Session.email = $scope.email;
            Session.password = $scope.password;
            $location.path('/home');
          } else {
            alert('Wrong password :(');
          }
        });
      } else {
        AuthService.registerUser($scope.email, $scope.password).success(function(data) {
          if (data.result) {
            $scope.performLogin();
          } else {
            alert('Registration failed! :(');
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
  
  this.registerUser = function(email, password) {
    var params = Api.getParams();
    params.cmd = 'create_user';
    params.email = email;
    params.password = password;
    return $http.get(Api.url, { params: params });
  };
})
;
