angular.module('shopper', [
    'ngTouch',
    'ngAnimate',
    'angular-gestures',
    'angular-carousel',
    'templates-app',
    'templates-common',
    'ui.router',
    'ui.bootstrap',
    'shopper.auth',
    'shopper.home',
    'shopper.list'
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
        if (! Session.isLoggedIn()) {
            $location.path('/auth');
        }
    });

    $scope.logout = function() {
        if (confirm('Sure you want to log out?')) {
            Session.logout();
        }
    };
    
    $scope.bodyClicked = function() {
        $scope.$broadcast('bodyClicked');
    };

    if (typeof localStorage.user !== 'undefined') {
        Session.login(JSON.parse(localStorage.user));
        $location.path('/home');
    }
})
.service('Session', function($location) {
    var self = this;
    this.user = undefined;

    this.login = function(user) {
        self.user = user;
    };

    this.logout = function() {
        self.user = undefined;
        localStorage.removeItem('user');
        $location.path('/auth');
    };

    this.isLoggedIn = function() {
        return (self.user) ? true : false;
    };
})
.service('Api', function(Session) {
    this.url = '../api/';

    this.getParams = function() {
        var params = {};
        if (Session.user !== undefined) {
            params =  {
                email: Session.user.email,
                password: Session.user.password
            };
        }
        return params;
    };
})
;