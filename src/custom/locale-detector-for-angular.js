var GlobalAppLocale = '';

// LOCALIZE APP (needs to be invoked directly after AngularJS integration!)
function localizeAppError(locale) {
	var defaultLocale = 'en-gb';
	if (locale === defaultLocale) {
		console.log('Error: File for locale "' + defaultLocale + '" does not exist!');
		return;
	}
	var localeLanguageStringLength = 2;
	if (locale.length > localeLanguageStringLength) {
		localizeApp(locale.substr(0, localeLanguageStringLength));
	} else {
		localizeApp(defaultLocale);
	}
}

function localizeApp(locale) {
    var scriptTagString = '<script type="text/javascript" src="i18n/angular-locale_' + locale + '.js" onerror="localizeAppError(\'' + locale + '\')"><\/script>';
    try {
        MSApp.execUnsafeLocalFunction(function () {
            document.write(scriptTagString);
        });
    } catch (e) {
        document.write(scriptTagString);
    }
}
if (navigator.language) {
	GlobalAppLocale = navigator.language;
} else if (navigator.userLanguage) {
	GlobalAppLocale = navigator.userLanguage;
}
GlobalAppLocale = GlobalAppLocale.replace(/_/g, '-').toLowerCase();
localizeApp(GlobalAppLocale);