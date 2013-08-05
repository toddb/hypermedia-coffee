var allTestFiles = [];
var TEST_REGEXP = /\/(test\/unit).*Spec\.js$/;  //includes test folder for limiting

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/public/js',

  paths: {
    'templates': '../templates',

    'jquery': '../vendor/jquery/dist/jquery',
    'underscore': '../vendor/underscore/underscore',
    'angularjs': '../vendor/angularjs/angular',
    'angular-ui-jam': '../vendor/angular-ui-jam/angular-ui',
    'angular-ui-bootstrap': '../vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.1.0',
    'mocks': '../../test/support/angular/angular-mocks',
    'chai': '../../node_modules/chai/chai'
  },

  // example of using shim, to load non AMD libraries
  shim: {
    'underscore': { exports: '_' },
    'angular': {'exports': 'angularjs'},
    'mocks': {deps: ['angularjs'], 'exports': 'angular.mock'},
    'chai': { exports: 'chai' },
    'angular-ui-jam': { deps: ['angularjs']},
    'angular-ui-bootstrap': { deps: ['angularjs']}
  },
  priority: [
    "angularjs"
  ],

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kick of jasmine, as it is asynchronous
  callback: window.__karma__.start
});