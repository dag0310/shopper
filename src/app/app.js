angular.module('shopper', [
  'templates-app',
  'templates-common',
  'ui.router',
  'shopper.home',
  'shopper.auth'
])
.config(function myAppConfig($stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/home');
  
  $httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
.run(function run () {
  
})
.controller('AppCtrl', function($scope, $location, Session) {
  if (typeof localStorage.email === 'string' && typeof localStorage.password === 'string') {
    Session.login(localStorage.email, localStorage.password);
    $location.path('/home');
  }
  
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if (! Session.isLoggedIn()) {
      $location.path('/auth');
    }
  });
  
  $scope.logout = function() {
    Session.logout();
    $location.path('/auth');
  };
})
.service('Session', function() {
  var self = this;
  this.email = undefined;
  this.password = undefined;
  
  this.login = function(email, password) {
    self.email = email;
    self.password = password;
  };
  
  this.logout = function() {
    self.email = undefined;
    self.password = undefined;
    localStorage.removeItem('email');
    localStorage.removeItem('password');
  };
  
  this.isLoggedIn = function() {
    return (self.email && self.password) ? true : false;
  };
})
.service('Api', function(Session) {
  this.url = '../api/';

  this.getParams = function() {
    return {
      email: Session.email,
      password: Session.password
    };
  };
})
;