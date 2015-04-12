/*global require*/
var gulp = require('gulp'),
    rimraf = require('rimraf'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    autoprefixer = require('gulp-autoprefixer'),
    inject = require('gulp-inject'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    htmlReplace = require('gulp-html-replace'),
    ngmin = require('gulp-ngmin'),
    rjs = require('requirejs'),
    gif = require('gulp-if'),
    es = require('event-stream'),
    lr = require('gulp-livereload'),
    _ = require('lodash'),
    karma = require('karma').server,
    yargs = require('yargs'),
    mkdirp = require('mkdirp'),
    webserver = require('gulp-webserver');


var args = yargs.argv;
var version = args['version'] || '0.0.0.0';
var api = args['api'] || 'http://localhost:8888/api/'; // https://your-api.example

var inBuildEnvironment = process.env.TEAMCITY_VERSION;
var browsers = !inBuildEnvironment ? ['Chrome', 'PhantomJS'] : ['PhantomJS'];
var reporters =  !inBuildEnvironment ? ['progress'] : ['teamcity'];

/**
 *  Main build targets
 */
gulp.task('default', ['build', 'test']);
gulp.task('build', ['build-html', 'build-requirejs']);

gulp.task('dev', ['default', 'watch']);

gulp.task('watch', function () {
  lr.listen();
  gulp
      .watch('src/**/*', ['build'])
      .on('change', lr.changed);
});

/**
 *  Clean the generated files
 */
gulp.task('clean', function (done) {
  rimraf('dist', function () {
    mkdirp('dist');
    done();
  });
});


gulp.task('build-html', ['clean'], function () {
  return gulp.src('src/index.html')
      .pipe(htmlReplace({
        api: {
          src: api,
          tpl: '<link rel="api" href="%s"/>'
        },
        app: {
          src: 'scripts/app.js?v=' + version,
          tpl: '<script data-main="%s" src="scripts/bootstrap.js"></script>'
        }
      }))
      .pipe(minifyHTML({empty: true, quotes: true}))
      .pipe(gulp.dest('dist'));
});

/**
 * @see https://gist.github.com/rafaelrinaldi/11008190
 * @see https://github.com/jrburke/r.js/blob/master/build/example.build.js
 *
 * `requirejs-backup-css` is required because of a bug in requirejs deleting external files - you
 * then must call `requirejs-restore-css` after. This is done in the `build-requirejs` target
 * @see still getting bootstrap css files deleted as at v2.1.16
 *      --> https://github.com/jrburke/requirejs/issues/755
 *
 *  Note: if you get the error:    Error: ENOENT, lstat '/hypermedia-coffee/client/bower_components/bootstrap/dist/css/bootstrap.css'
 *        then you will need to reinstall the bootstrap library: delete from file system and then `node_modules/.bin/bower update`
 */
gulp.task('build-requirejs', ['clean', 'requirejs-backup-css'], function (done) {

  rjs.optimize({
    appDir: 'src',
    baseUrl: 'scripts',
    dir: 'dist',

    logLevel: 1,

    optimize: 'uglify2',
    mainConfigFile: 'src/scripts/main.js',

    modules: [
      {
        name: 'bootstrap',
        include: ['requirejs'],
        exclude: ['app'],
        create: true
      },
      {
        name: 'app',
        include: ['boot'],
        excludeShallow: ['requirejs']
      }
    ],
    // still getting bootstrap css files deleted as at v2.1.16
    // see: https://github.com/jrburke/requirejs/issues/755
    removeCombined: true,

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
      warnings: false,
      mangle: false
    }
  }, function () {
    // sorry, this must be started after all the require work has completed
    gulp.start('requirejs-restore-css');
    done();
  }, function (err) {
    console.log(err);
  });
});


/**
 * Only required because of bug in requirejs - saves the file to a `./tmp` directory
 *
 * @see still getting bootstrap css files deleted as at v2.1.16
 *      --> https://github.com/jrburke/requirejs/issues/755
 *
 */
gulp.task('requirejs-backup-css', function (done) {
  gulp.src('./bower_components/bootstrap/dist/css/bootstrap.css')
      .pipe(gulp.dest('./tmp'))
      .on('end', function () {
        // make sure the task runs sequentially
        // see https://github.com/gulpjs/gulp/issues/67
        done();
      });
});

/**
 * Only required because of bug in requirejs - restores file and deletes `./tmp` directory
 *
 * @see still getting bootstrap css files deleted as at v2.1.16
 *      --> https://github.com/jrburke/requirejs/issues/755
 */
gulp.task('requirejs-restore-css', function () {
  gulp.src('./tmp/**')
      .pipe(clean())
      .pipe(gulp.dest('./bower_components/bootstrap/dist/css'));
});

var karmaCommonConf = __dirname + '/karma.conf.js';
/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: karmaCommonConf,
    browsers: browsers,
    reporters: reporters,
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

gulp.task('client', ['build', 'test'], function () {
  gulp.src('dist')
      .pipe(webserver({
        livereload: true,
        directoryListing: false,
        open: true,
        port: 8668
      }));
});