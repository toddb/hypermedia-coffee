/*global require*/
var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

/**
 * Micro/Integration tests are running under `exports` - TODO: should be refactored to `spec`
 * Acceptance is already under spec because of an async issue with supertest
 *
 * Configured such that when teamcity if available it reports to teamcity just like magic
 * see: https://confluence.jetbrains.com/display/TCD8/Predefined+Build+Parameters
 */
var mocha_opts = {
  reporter: (process.env.TEAMCITY_VERSION == undefined) ? 'spec' : 'mocha-teamcity-reporter',
  ui: 'exports'
};

var mongoose;

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
  return gulp.src('test/micro/**/*Test.js', {read: false})
      .pipe(plugins.debug())
      .pipe(plugins.mocha(mocha_opts));
});

gulp.task('integration', ['env:test'], function (done) {
  mongoose = mongoose ? mongoose : require('./src/config/mongoose');
  var error;

  mongoose.connect(function () {
    gulp.src('test/integration/**/*Test.js')
        .pipe(plugins.debug())
        .pipe(plugins.mocha(mocha_opts))
        .on('error', function (err) {
          error = err;
          plugins.util.log(plugins.util.colors.red('Error (' + err.message + ')\n') + err.code + '\n' + err.stack);
        })
        .on('end', function () {
          mongoose.disconnect(function () {
            done(error);
            //process.exit(error ? 1 : 0);
          });
        });
  });
});


gulp.task('integrationSpec', ['env:test'], function (done) {
  mongoose = mongoose ? mongoose : require('./src/config/mongoose');
  var error;

  mongoose.connect(function () {
    gulp.src(['test/integration/**/*Spec.js', '!test/integration/**/aclSpec.js'])
        .pipe(plugins.debug())
        .pipe(plugins.mocha({reporter: 'spec', ui: 'bdd'}))
        .on('error', function (err) {
          error = err;
          plugins.util.log(plugins.util.colors.red('Error (' + err.message + ')\n') + err.code + '\n' + err.stack);
        })
        .on('end', function () {
          mongoose.disconnect(function () {
            done(error);
            //process.exit(error ? 1 : 0);
          });
        });
  });
});

gulp.task('acl', function () {
  gulp.src('test/integration/**/*Spec.js', {read: false})
      .pipe(plugins.debug())
      .pipe(plugins.mocha({reporter: 'spec', ui: 'bdd'}));
})

gulp.task('acceptance', ['env:test'], function (done) {
  mongoose = mongoose ? mongoose : require('./src/config/mongoose');
  var error;

  mongoose.connect(function () {
    gulp.src('test/acceptance/**/*Spec.js')
        .pipe(plugins.debug())
        .pipe(plugins.mocha({reporter: process.env.TEAMCITY_VERSION == undefined ? 'spec' : 'mocha-teamcity-reporter'}))
        .on('error', function (err) {
          error = err;
          plugins.util.log(plugins.util.colors.red('Error (' + err.message + ')\n') + err.code + '\n' + err.stack);
        })
        .on('end', function () {
          mongoose.disconnect(function () {
            done(error);
            process.exit(error ? 1 : 0);
          });
        });
  });
});

