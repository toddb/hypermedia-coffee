/*global require*/
var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

var mocha_opts = {
  reporter: 'spec',
  ui: 'exports'
};

gulp.task('default', ['micro']);

gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test';
});

gulp.task('env:dev', function () {
  process.env.NODE_ENV = 'development';
});

gulp.task('env:prod', function () {
  process.env.NODE_ENV = 'production';
});

gulp.task('micro', ['env:test'], function () {
  return gulp.src('test/micro/**/*.js', {read: false})
      .pipe(plugins.debug())
      .pipe(plugins.mocha(mocha_opts));
});

gulp.task('integration', ['env:test'], function (done) {
  var mongoose = require('./app/config/mongoose');
  var error;

  mongoose.connect(function () {
    gulp.src('test/integration/**/*.js')
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

gulp.task('acceptance', ['env:test'], function (done) {
  var mongoose = require('./app/config/mongoose');
  var error;

  mongoose.connect(function () {
    gulp.src('test/acceptance/**/*.js')
        .pipe(plugins.debug())
        .pipe(plugins.mocha(mocha_opts))
        .on('error', function (err) {
          error = err;
        })
        .on('end', function () {
          mongoose.disconnect(function () {
            done(error);
            process.exit(0);
          });
        });
  });
});

