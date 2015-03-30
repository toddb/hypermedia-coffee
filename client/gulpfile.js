/*global require*/
var gulp = require('gulp'),
    rimraf = require('rimraf'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    autoprefixer = require('gulp-autoprefixer'),
    inject = require('gulp-inject'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    htmlReplace = require('gulp-html-replace'),
    ngmin = require('gulp-ngmin'),
    gulprjs = require('gulp-requirejs'),
    rjs = require('requirejs'),
    gif = require('gulp-if'),
    es = require('event-stream'),
    lr = require('gulp-livereload'),
    saveLicense = require('uglify-save-license'),
    _ = require('lodash'),
    karma = require('karma').server,
    yargs = require('yargs'),
    mkdirp = require('mkdirp'),
    webserver = require('gulp-webserver');


var args = yargs.argv;
var version = args['version'] || '0.0.0.0';
var api = args['api'] || 'http://localhost:8888'; // https://your-api.example

// Build
gulp.task('default', ['build', 'requirejsBuild', 'assets']);

gulp.task('dev', ['default', 'watch']);


gulp.task('watch', function () {
  lr.listen();
  gulp
      .watch('src/**/*', ['build', 'assets'])
      .on('change', lr.changed);
});
/**
 *  Clean the generated files
 */
gulp.task('clean', function (cb) {
  rimraf('dist', function () {
    mkdirp('dist');
    cb();
  });
});


gulp.task('build', ['clean'], function () {
  var nonVendor = 'scripts/**/*.js';
  var opts = {empty: true, quotes: true};
  var htmlPath = {
    htmlSrc: './scripts/**/*.html',
    htmlDest: './dist'
  };
  return gulp.src('src/index.html')
      .pipe(gif(nonVendor, ngmin()))
      .pipe(gif('*.js', uglify({
        mangle: false,
        preserveComments: saveLicense
      })))

      .pipe(htmlReplace({
        api: {
          src: [[api, api]],
          tpl: '<link rel="api" href="%s"/><link rel="authenticator" href="%s/session/"/>'
        },
        app: {
          src: 'scripts/app.js?v=' + version,
          tpl: '<script data-main="%s" src="scripts/bootstrap.js"></script>'
        }
      }))

      .pipe(minifyHTML(opts))
      .pipe(gulp.dest('dist'));
});

/**
 * @see https://gist.github.com/rafaelrinaldi/11008190
 * @see https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
gulp.task('requirejsBuild', ['clean'], function (cb) {
  rjs.optimize({
    appDir: 'src',
    baseUrl: 'scripts',
    dir: './dist',

    logLevel: 1,

    // optimize: 'uglify2',
    optimize: 'none',
    mainConfigFile: 'src/scripts/main.js',

    modules: [
      {
        name: 'bootstrap',
        include: ['requirejs'],
        exclude: ['app'], //, 'angular'],
        create: true
      },
      {
        name: 'app',
        include: ['boot'],
        excludeShallow: ['requirejs']
      }
    ],
    uglify2: {
      output: {
        beautify: true
      },
      compress: {
        sequences: false,
        global_defs: {
          DEBUG: false
        }
      },
      warnings: true,
      mangle: false
    }
  }, function (buildResponse) {
    cb();
  }, function (err) {
    console.log(err);
  });
});


gulp.task('assets', ['clean'], function (cb) {
  return gulp.src([
    'src/README.md'
  ], {base: 'src'})
      .pipe(gulp.dest('dist'));
});

var karmaCommonConf = __dirname + '/karma.conf.js';
/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: karmaCommonConf,
    singleRun: true
  }, done);
});

gulp.task('test-travis', function (done) {
  karma.start({
    configFile: karmaCommonConf,
    browsers: ['PhantomJS', 'Firefox'],
    singleRun: true
  }, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  karma.start({
    configFile: karmaCommonConf
  }, done);
});

gulp.task('client', ['default'], function () {
  gulp.src('dist')
      .pipe(webserver({
        livereload: true,
        directoryListing: false,
        open: true,
        port: 63344
      }));
});