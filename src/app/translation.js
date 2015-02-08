angular.module('shopper.translation', [])
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
            'aus'],
        REGISTER: [
            'Sign up',
            'Registrieren'
        ],
        LOGIN: [
            'Login',
            'Anmelden'
        ],
        LOGOUT: [
            'Logout',
            'Abmelden'],
        REFRESH: [
            'Refresh',
            'Aktualisieren'],
        HELLO: [
            'Hello',
            'Hallo'
        ],
        ADD_LIST: [
            'New list',
            'Neue Liste'],
        TRANSLATION_FAILED: [
            'Registration failed',
            'Registrierung fehlgeschlagen'
        ],
        REMEMBER_CREDENTIALS: [
            'Remember credentials',
            'Zugangsdaten merken'
        ],
        EMAIL: [
            'E-mail',
            'E-Mail'
        ],
        PASSWORD: [
            'Password',
            'Passwort'
        ],
        USERNAME: [
            'Username',
            'Benutzername'
        ],
        YOUR_NAME: [
            'Your name (so others can find you)',
            'Dein Name (damit dich andere finden können)'
        ],
        WHAT_SHOULD_WE_CALL_IT: [
            'What should we call the list?',
            'Wie soll die Liste heißen?'
        ],
        LIST_EMPTY: [
            'This list is empty',
            'Diese Liste ist leer'
        ],
        SHIFT_LEFT: [
            'Shift list one to the left',
            'Liste eins nach links verschieben'
        ],
        SHIFT_RIGHT: [
            'Shift list one to the right',
            'Liste eins nach rechts verschieben'
        ],
        UNTITLED: [
            'Untitled',
            'Unbenannt'
        ],
        UNSUBSCRIBE_SURE: [
            'Are you sure you want to unsubscribe from this list?',
            'Diese Liste sicher abbestellen?'
        ],
        SEARCH: [
            'What do you need?',
            'Was brauchst du?'
        ],
        SURE_LOGOUT: [
            'Are you sure you want to logout?',
            'Sicher abmelden?'
        ],
        ADD_SOMEBODY_TO_LIST: [
            'Add somebody to the list',
            'Jemanden zur Liste hinzufügen'
        ],
        CHANGE_LIST_NAME: [
            'Change list name',
            'Listennamen ändern'
        ],
        UNSUBSCRIBE: [
            'Unsubscribe',
            'Abbestellen'
        ],
        ADD: [
            'Add',
            'Hinzufügen'
        ],
        CHANGE_COMMENT: [
            'Change comment',
            'Kommentar ändern'
        ]
    });

    // Generate translation objects
    for (var key in translations) {
        for (i = 0; i < this.languages.length; i++) {
            this.translations[this.languages[i]][key] = translations[key][i];
        }
    }
    
    this.$get = []; // $get required by provider
});