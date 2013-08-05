/**
 * @fileOverview
 * The main application entry point.
 */
define([
  'angularjs-unstable',
  'controllers/orderCtrl',
  'controllers/authenticatorCtrl',
  'controllers/payCtrl',
  'services/resource',
  'directives/x-form',
  'directives/buttonsRadio',
  'angular-ui-bootstrap',
  'angular-ui-jam'
],
  function () {
    'use strict';

    var app;

    var initialize = function () {

      app = angular.module('app', ['authenticator', 'app.controllers', 'app.services', 'ui.bootstrap', 'ui.filters']);

      app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider.
          when('/', {
            templateUrl: '/templates/partials/order/get.html',
            controller: 'OrderCtrl',
            reloadOnSearch: false
          });

        /* currently html5 history won't work because I would need to implement
         * better content negotiation on the server. The big test is that I should
         * be able to press refresh on the browser at any point and get the page back
         */
        $locationProvider.html5Mode(false);

        /*
         * To make this work with angular 1.0.6, patch angularjs
         *
         * Works in 1.1.4 - unstable
         *
         *     config.withCredentials = config.withCredentials || $config.withCredentials;
         *
         *  8862    function $http(config) {
         *            config.method = uppercase(config.method);
         *            config.withCredentials = config.withCredentials || $config.withCredentials;
         */
        $httpProvider.defaults.withCredentials = true;

      }]);

      return app;
    };

    var start = function () {
      angular.element(document).ready(function () {
        // Because of RequireJS we need to bootstrap the app manually
        // and Angular Scenario runner won't be able to communicate with our app
        // unless we explicitly mark the container as app holder
        // More info: https://groups.google.com/forum/#!msg/angular/yslVnZh9Yjk/MLi3VGXZLeMJ
        var el = document.querySelector('body');
        angular.bootstrap(angular.element(el).addClass('ng-app'), [app['name']]);
      });
    };


    return {
      initialize: initialize,
      start: start
    };

  });
