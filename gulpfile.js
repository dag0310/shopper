/* global require */

// INITIALIZATION
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var packageJSON  = require('./package');
var jshintConfig = packageJSON.jshintConfig;
jshintConfig.lookup = false;

// Plugins
var plugins = gulpLoadPlugins();
plugins.del = require('del');
plugins.streamqueue = require('streamqueue');

// ----------------------------
// V A R S
// ----------------------------
var Filenames = function() {
    this.database = 'shopper.db';
    this.index = 'index.html';
    this.app = 'app.js';
    this.templatesModuleName = 'templates-app';

    var distName = 'package';
    this.packageCss = distName + '.css';
    this.packageJs = distName + '.js';
};
var filenames = new Filenames();

var Paths = function() {
    this.src = 'src/';
    this.vendor = 'vendor/';
    this.app = this.src + 'app/';
    this.custom = this.src + 'custom/';
    this.styles = this.src + 'styles/';
    this.images = this.src + 'images/';
    this.api = 'api/';

    this.build = 'build/';
    this.buildStyles = this.build + 'styles/';
    this.buildScripts = this.build + 'scripts/';
    this.buildImages = this.build + 'images/';
    this.buildFonts = this.build + 'fonts/';

    this.dist = 'dist/';
    this.distStyles = this.dist + 'styles/';
    this.distScripts = this.dist + 'scripts/';
    this.distImages = this.dist + 'images/';
    this.distFonts = this.dist + 'fonts/';
};
var paths = new Paths();

var Files = function() {
    this.src = paths.src + '**';
    this.index = paths.src + filenames.index;
    this.styles = paths.styles + '**';
    this.appScriptsAll = paths.app + '**/*.js';
    this.appSpecs = paths.app + '**/*.spec.js';
    this.appScripts = [this.appScriptsAll, '!' + this.appSpecs];
    this.appStyles = paths.app + '**/*.less';
    this.templatesApp = paths.app + '**/*.html';
    this.images = paths.images + '**';
    this.karmaConf = 'karma.conf.js';

    this.buildStyles = paths.buildStyles + '**';
    this.buildScripts = paths.buildScripts + '**';

    this.distStyles = paths.distStyles + '**';
    this.distScripts = paths.distScripts + '**';
    this.packageCss = paths.distStyles + filenames.packageCss;
    this.packageJs = paths.distScripts + filenames.packageJs;
};
var files = new Files();

// ----------------------------
// S O U R C E S
// ----------------------------
var sources = {};

sources.js = [
    paths.vendor + 'spark-md5/spark-md5.min.js',
    paths.vendor + 'jquery/dist/jquery.js',
    paths.vendor + 'add-to-homescreen/src/addtohomescreen.js',
    paths.vendor + 'hammerjs/hammer.js',
    paths.vendor + 'angular/angular.js',
    paths.vendor + 'angular-touch/angular-touch.js',
    paths.vendor + 'angular-animate/angular-animate.js',
    paths.vendor + 'angular-translate/angular-translate.js',
    paths.vendor + 'angular-ui-router/release/angular-ui-router.js',
    paths.vendor + 'angular-gestures/gestures.js',
    paths.vendor + 'angular-bootstrap/ui-bootstrap-tpls.js',
    paths.vendor + 'angular-carousel/dist/angular-carousel.js'
]
.concat([
    paths.custom + 'global.js',
    paths.custom + 'locale-detector-for-angular.js',
    paths.app + filenames.app
])
.concat(files.appScripts);

sources.css = [
    paths.vendor + 'font-awesome/css/font-awesome.min.css',
    paths.vendor + 'angular-carousel/dist/angular-carousel.min.css',
    paths.vendor + 'add-to-homescreen/style/addtohomescreen.css'
];

sources.less = [
    paths.styles + 'main.less',
    files.appStyles
];

sources.karma = [
    paths.vendor + 'angular/angular.js',
    paths.vendor + 'angular-ui-router/release/angular-ui-router.js',
    paths.vendor + 'angular-mocks/angular-mocks.js',
    files.appScriptsAll
];

// ----------------------------
// G E N E R A L   T A S K S
// ----------------------------
gulp.task('db', function() {
    return gulp.src(paths.src + filenames.database)
    .pipe(gulp.dest(paths.api));
});

gulp.task('lint', function() {
    return gulp.src(files.appScriptsAll)
    .pipe(plugins.jshint(jshintConfig))
    .pipe(plugins.jshint.reporter('jshint-stylish'));
    //.pipe(plugins.jshint.reporter('fail'));
});

gulp.task('test', function() {
    return gulp.src(sources.karma)
    .pipe(plugins.karma({
        configFile: files.karmaConf,
        action: 'run'
    }))
    .on('error', function(err) {
        throw err;
    });
});

gulp.task('clean', ['build:clean', 'dist:clean']);

// ----------------------------
// B U I L D
// ----------------------------
// Clean build directory
gulp.task('build:clean', function(callback) {
    plugins.del([paths.build], callback)
    .pipe(plugins.notify({ message: 'Clean task complete' }));
});

// Minify & Concat CSS
gulp.task('build:css', function() {
    return plugins.streamqueue(
        { objectMode: true },
        gulp.src(sources.css),
        gulp.src(sources.less)
        .pipe(plugins.plumber(function(error) {
            plugins.util.log(plugins.util.colors.red(error.message));
            plugins.util.beep();
            this.emit('end');
        }))
        .pipe(plugins.less())
    )
    .pipe(plugins.flatten())
    .pipe(plugins.newer(paths.buildStyles))
    .pipe(gulp.dest(paths.buildStyles))
    .pipe(plugins.notify({ message: 'CSS task complete' }));
});

// Minify & Concat JS
gulp.task('build:js', function() {
    return plugins.streamqueue(
        { objectMode: true },
        gulp.src(sources.js, {nosort: true})
        .pipe(plugins.ngAnnotate()),
        gulp.src(files.templatesApp)
        .pipe(plugins.ngHtml2js({moduleName: filenames.templatesModuleName}))
    )
    .pipe(plugins.flatten())
    .pipe(plugins.newer(paths.buildScripts))
    .pipe(gulp.dest(paths.buildScripts))
    .pipe(plugins.notify({ message: 'JS task complete' }));
});

gulp.task('build:images', function() {
    return gulp.src(files.images)
    .pipe(plugins.newer(paths.buildImages))
    .pipe(gulp.dest(paths.buildImages))
    .pipe(plugins.notify({ message: 'Images task complete' }));
});

gulp.task('build:fonts', function() {
    gulp.src('vendor/font-awesome/fonts/*')
    .pipe(plugins.newer(paths.buildFonts))
    .pipe(gulp.dest(paths.buildFonts))
    .pipe(plugins.notify({ message: 'Fonts task complete' }));
});

gulp.task('build:i18n', function() {
    var i18nFolder = 'i18n/';
    var destPath = paths.build + i18nFolder;
    return gulp.src(paths.src + i18nFolder + '*.js')
    .pipe(plugins.newer(destPath))
    .pipe(gulp.dest(destPath))
    .pipe(plugins.notify({ message: 'i18n task complete' }));
});

gulp.task('build:indexcopy', function() {
    gulp.src(paths.src + filenames.index)
    .pipe(plugins.newer(paths.build))
    .pipe(gulp.dest(paths.build))
    .pipe(plugins.notify({ message: 'Index copy task complete' }));
});

// Inject styles and scripts into index.html
gulp.task('build:index', ['build:css', 'build:js', 'build:indexcopy'], function() {
    var jsStreamOrdered = [], i;
    for (i = 0; i < sources.js.length; i++) {
        jsStreamOrdered.push(paths.buildScripts + sources.js[i].split('/').pop());
    }
    var injectionSources = gulp.src([files.buildStyles].concat(jsStreamOrdered), {read: false});

    return gulp.src(paths.build + filenames.index)
    .pipe(plugins.inject(injectionSources, {relative:true}))
    .pipe(gulp.dest(paths.build))
    .pipe(plugins.notify({ message: 'Index task complete' }));
});

// ----------------------------
// D I S T
// ----------------------------

// Clean dist directory
gulp.task('dist:clean', function(callback) {
    plugins.del([paths.dist], callback)
    .pipe(plugins.notify({ message: 'Clean task complete' }));
});

// Minify & Concat CSS
gulp.task('dist:css', function() {
    return plugins.streamqueue(
        { objectMode: true },
        gulp.src(sources.css),
        gulp.src(sources.less)
        .pipe(plugins.plumber(function(error) {
            plugins.util.log(plugins.util.colors.red(error.message));
            plugins.util.beep();
            this.emit('end');
        }))
        .pipe(plugins.less())
    )
    .pipe(plugins.newer(files.packageCss))
    .pipe(plugins.minifyCss())
    .pipe(plugins.concat(filenames.packageCss))
    .pipe(gulp.dest(paths.distStyles))
    .pipe(plugins.notify({ message: 'CSS task complete' }));
});

// Minify & Concat JS
gulp.task('dist:js', function() {
    return plugins.streamqueue(
        { objectMode: true },
        gulp.src(sources.js)
        .pipe(plugins.ngAnnotate()),
        gulp.src(files.templatesApp)
        .pipe(plugins.ngHtml2js({moduleName: filenames.templatesModuleName}))
    )
    .pipe(plugins.newer(files.packageJs))
    .pipe(plugins.uglify())
    .pipe(plugins.concat(filenames.packageJs))
    .pipe(gulp.dest(paths.distScripts))
    .pipe(plugins.notify({ message: 'JS task complete' }));
});

gulp.task('dist:images', function() {
    return gulp.src(files.images)
    .pipe(plugins.newer(paths.distImages))
    .pipe(gulp.dest(paths.distImages))
    .pipe(plugins.notify({ message: 'Images task complete' }));
});

gulp.task('dist:fonts', function() {
    gulp.src('vendor/font-awesome/fonts/*')
    .pipe(plugins.newer(paths.distFonts))
    .pipe(gulp.dest(paths.distFonts))
    .pipe(plugins.notify({ message: 'Fonts task complete' }));
});

gulp.task('dist:i18n', function() {
    var i18nFolder = 'i18n/';
    return gulp.src(paths.src + i18nFolder + '*.js')
    .pipe(plugins.newer(paths.dist + i18nFolder))
    .pipe(gulp.dest(paths.dist + i18nFolder))
    .pipe(plugins.notify({ message: 'i18n task complete' }));
});

gulp.task('dist:indexcopy', function() {
    gulp.src(paths.src + filenames.index)
    .pipe(plugins.newer(paths.dist))
    .pipe(gulp.dest(paths.dist))
    .pipe(plugins.notify({ message: 'Index copy task complete' }));
});

// Inject styles and scripts into index.html
gulp.task('dist:index', ['dist:css', 'dist:js', 'dist:indexcopy'], function() {
    var injectionSources = gulp.src([files.distStyles, files.distScripts], {read: false});
    return gulp.src(paths.dist + filenames.index)
    .pipe(plugins.inject(injectionSources, {relative:true}))
    .pipe(gulp.dest(paths.dist))
    .pipe(plugins.notify({ message: 'Index task complete' }));
});

// ----------------------------
// ----------------------------
// ----------------------------
// M E T A   T A S K S
// ----------------------------
// ----------------------------
// ----------------------------
var i;
var buildTasks = ['css', 'js', 'images', 'fonts', 'i18n', 'index'];
var buildFastTask = [], buildTask = ['lint', 'test'], distTask = ['lint', 'test'];
for (i = 0; i < buildTasks.length; i++) {
    buildFastTask.push('build:' + buildTasks[i]);
    buildTask.push('build:' + buildTasks[i]);
    distTask.push('dist:' + buildTasks[i]);
}

gulp.task('build_fast', buildFastTask);
gulp.task('build', buildTask);
gulp.task('dist', distTask);

gulp.task('watch', ['build'], function() {
    gulp.watch([files.appScripts, files.templatesApp], ['lint', 'build:js']);
    gulp.watch([files.appScripts], ['test']);
    gulp.watch(files.index, ['build:index']);
    gulp.watch([files.appStyles, files.styles], ['build:css']);
});
gulp.task('watch_fast', ['build_fast'], function() {
    gulp.watch([files.appScripts, files.templatesApp], ['build:js']);
    gulp.watch(files.index, ['build:index']);
    gulp.watch([files.appStyles, files.styles], ['build:css']);
});

gulp.task('default', ['watch']);