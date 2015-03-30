var allTestFiles = [];
var TEST_REGEXP = /\/(test).*Spec\.js$/;  //includes test folder for limiting

var pathToModule = function (path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});
require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
    'templates': 'src/scripts/template',

    'jquery': 'bower_components/jquery/dist/jquery',
    'underscore': 'bower_components/underscore/underscore',
    'angular': 'bower_components/angular/angular',
    'angular-ui-utils': 'bower_components/angular-ui-utils/ui-utils',
    'mocks': 'bower_components/angular-mocks/angular-mocks',
    'chai': 'node_modules/chai/chai',
    'util/uriMapping': 'src/scripts/util/uriMapping'
  },

  // example of using shim, to load non AMD libraries
  shim: {
    'jquery': {exports: 'jquery'},
    'underscore': {exports: '_'},
    'angular': {'exports': 'angular'},
    'mocks': {deps: ['angular'], 'exports': 'angular.mock'},
    'chai': {exports: 'chai'}
  },
  priority: [
    "angular"
  ],

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kick of jasmine, as it is asynchronous
  callback: window.__karma__.start
});