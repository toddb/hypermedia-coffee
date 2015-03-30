/*global require*/
var gulp = require('gulp'),
    debug = require('gulp-debug'),
    mocha = require('gulp-mocha'),
    yargs = require('yargs');


var args = yargs.argv;
var version = args['version'] || '0.0.0.0';
var api = args['client'] || 'http://localhost:64433'; // https://your-api.example

gulp.task('default', ['micro', 'integration', 'acceptance']);

gulp.task('micro', function () {
  return gulp.src('test/micro/**/*.js', {read: false})
      .pipe(debug())
      .pipe(mocha({
        reporter: 'spec',
        ui: 'exports'
      }));
});

gulp.task('integration', function () {
  return gulp.src(['test/integration/**/*.js', '!test/integration/resources/payTest.js'], {read: false})
      .pipe(debug())
      .pipe(mocha({
        reporter: 'spec',
        ui: 'exports'
      }));
});


gulp.task('acceptance', function () {
  return gulp.src(['test/acceptance/**/*.js'], {read: false})
      .pipe(debug())
      .pipe(mocha({
        reporter: 'spec',
        ui: 'exports'
      }));
});

gulp.task('watch-tests', function () {
  gulp.watch(['app/**'], ['micro', 'integration', 'acceptance']);
});
