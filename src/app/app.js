angular.module('shopper', [
    'ngTouch',
    'ngAnimate',
    'angular-gestures',
    'angular-carousel',
    'pascalprecht.translate',
    'ui.router',
    'ui.bootstrap',
    'templates-app',
    'shopper.translation',
    'shopper.auth',
    'shopper.home',
    'shopper.list'
])
.config(function myAppConfig($stateProvider, $urlRouterProvider, $httpProvider, $translateProvider, TranslationProvider) {
    $urlRouterProvider.otherwise('/home');

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    for (var i = 0; i < TranslationProvider.languages.length; i++) {
        var language = TranslationProvider.languages[i];
        $translateProvider.translations(language, TranslationProvider.translations[language]);
    }
    var deviceLanguage = GlobalAppLocale.substr(0, 2);
    var preferredLanguage = (Object.keys(TranslationProvider.translations).indexOf(deviceLanguage) !== -1) ? deviceLanguage : 'en';
    $translateProvider.preferredLanguage(preferredLanguage);
})
.run(function run () {

})
.controller('AppCtrl', function($scope, $location, $translate, Session) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if (! Session.isLoggedIn()) {
            $location.path('/auth');
        }
    });

    $scope.logout = function() {
        $translate('SURE_LOGOUT').then(function(translation) {
            if (confirm(translation))
                Session.logout();
        });
    };
    
    $scope.bodyClicked = function(event) {
        $scope.$broadcast('bodyClicked', event);
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
.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
})
;
;