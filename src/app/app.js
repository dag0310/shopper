angular.module('shopper', [
    'ngTouch',
    'ngAnimate',
    'angular-gestures',
    'angular-carousel',
    'pascalprecht.translate',
    'ui.router',
    'ui.bootstrap',
    'templates-app',
    'shopper.auth',
    'shopper.home',
    'shopper.list'
])
.config(function myAppConfig($stateProvider, $urlRouterProvider, $httpProvider, $translateProvider) {
    $urlRouterProvider.otherwise('/home');

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    /*for (var i = 0; i < TranslationProvider.language.length; i++) {
        var language = TranslationProvider.languages[i];
        $translateProvider.translations(language, TranslationProvider.translations[language]);
    }
    var deviceLanguage = GlobalAppLocale.substr(0, 2);
    var preferredLanguage = (Object.keys(TranslationProvider.translations).indexOf(deviceLanguage) !== -1) ? deviceLanguage : 'en';
    $translateProvider.preferredLanguage(preferredLanguage);*/
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
.provider('Translation', function() {
    var i;
    
    this.translations = {};

    this.languages = ['en', 'de'];
    
    // Initialize translations
    for (i = 0; i < this.languages.length; i++) {
        this.translations[this.languages[i]] = {};
    }

    var translations = Object.freeze({
        YES: [
            'Yes',
            'Ja'],
        NO: [
            'No',
            'Nein'],
        OK: [
            'OK',
            'OK'],
        SAVE: [
            'Save',
            'Speichern'],
        CANCEL: [
            'Cancel',
            'Abbrechen'],
        BACK: [
            'Back',
            'Zurück'],
        SETTINGS: [
            'Settings',
            'Einstellungen'],
        ON: [
            'on',
            'ein'],
        OFF: [
            'off',
            'aus']
    });

    // Generate translation objects
    for (var key in translations) {
        for (i = 0; i < this.languages.length; i++) {
            this.translations[this.languages[i]][key] = translations[key][i];
        }
    }
    
    this.$get = []; // $get required by provider
})
;