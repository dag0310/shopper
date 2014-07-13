angular.module('shopper', [
  'templates-app',
  'templates-common',
  'shopper.home',
  'ui.router'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
})
.run(function run () {
})
.controller('AppCtrl', function AppCtrl($scope, $location) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
  });
})
;