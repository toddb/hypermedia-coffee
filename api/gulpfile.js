/*global require*/
var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    yargs = require('yargs'),
    plugins = gulpLoadPlugins();


var args = yargs.argv;
var version = args['version'] || '0.0.0.0';
var api = args['client'] || 'http://localhost:64433'; // https://your-api.example
var mocha_opts = {
  reporter: 'spec',
  ui: 'exports'
};

gulp.task('default', ['micro', 'integration']);

gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
  process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
  process.env.NODE_ENV = 'production';
});

gulp.task('micro', function () {
  return gulp.src('test/micro/**/*.js', {read: false})
      .pipe(plugins.debug())
      .pipe(plugins.mocha(mocha_opts));
});

gulp.task('integration', function (done) {
  var mongoose = require('./config/mongoose');
  var error;

  mongoose.connect(function () {
    gulp.src('test/integration/**/*.js' )
        .pipe(plugins.debug())
        .pipe(plugins.mocha(mocha_opts))
        .on('error', function (err) {
          error = err;
        })
        .on('end', function () {
          mongoose.disconnect(function () {
            done(error);
          });
        });
  });
});

gulp.task('acceptance', function () {
  return gulp.src(['test/acceptance/**/*.js'], {read: false})
      .pipe(plugins.debug())
      .pipe(plugins.mocha(mocha_opts))
      .pipe(plugins.exit());
});
