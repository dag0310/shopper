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
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
  });
  
  if (typeof localStorage.email === 'string' && typeof localStorage.password === 'string') {
    Session.setSession(localStorage.email, localStorage.password);
  }
})
.service('Session', function() {
  var self = this;
  this.email = undefined;
  this.password =  undefined;
  
  this.setSession = function(email, password) {
    self.email = email;
    self.password = password;
  };
  
  this.isLoggedIn = function() {
    return (self.email !== undefined && self.password !== undefined) ? true : false;
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