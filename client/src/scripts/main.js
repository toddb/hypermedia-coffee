/**
 * @fileOverview
 * Sets up any configuration  and initializes the main application.
 */

require.config({
  baseUrl: "scripts",

  // alias libraries paths.  Must set 'angular'
  paths: {
    'angular': '../../bower_components/angular/angular',
    'angular-ui-utils': '../../bower_components/angular-ui-utils/ui-utils',
    'angular-ui-router': '../../bower_components/angular-ui-router/release/angular-ui-router',
    'angularAMD': '../../bower_components/angularAMD/angularAMD',
    'angular-bootstrap': '../../bower_components/angular-bootstrap/ui-bootstrap',
    'angular-bootstrap-tpls': '../../bower_components/angular-bootstrap/ui-bootstrap-tpls',
    'datejs': '../../bower_components/datejs/build/date',
    'jquery': '../../bower_components/jquery/dist/jquery',
    'requirejs': "../../bower_components/requirejs/require",
    'underscore': '../../bower_components/underscore/underscore'
  },

  // Add angular modules that does not support AMD out of the box, put it in a shim
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angularAMD': ['angular'],
    'angular-route': ['angular'],
    'angular-ui-utils': ['angular'],
    'angular-ui-router': ['angular'],// 'angular-route'],
    'angular-bootstrap': ['angular'],
    'angular-bootstrap-tpls': ['angular', 'angular-bootstrap'],

    /**
     * Date.js will extend the {@link Date} object with a {@link Date.TimeSpan}
     * and {@link Date.TimePeriod}.
     *
     * @see https://code.google.com/p/datejs/wiki/APIDocumentation
     */
    'datejs': {
      exports: 'Date'
    },
    'jquery': {
      exports: 'jquery'
    },
    'underscore': {
      exports: '_'
    }

  },

  // kick start application
  deps: ['boot']
});
