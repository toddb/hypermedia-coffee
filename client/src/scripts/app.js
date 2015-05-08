define(
    [
        'jquery',
        'angularAMD',
        'angular-ui-router',
        'angular-ui-utils',
        'angular-bootstrap',
        'angular-bootstrap-tpls',
        'filter/collection-filter',
        'filter/timeago-filter',
        'factory/httpLink',
        'util/uriMapping',
        'provider/uriMapper',
        'provider/httpAuthInterceptor',
        'controller/HomeController',
        'controller/OrdersController',
        'controller/OrderController',
        'controller/StateController',
        'controller/PayController',
        'controller/AuthenticatorController',
        'metis-menu',
        'sb-admin-2',
        'slidebars'

    ],
    function ($, angularAMD) {
        var app = angular
            .module('app', [
                'ui.router', 'ui.utils', 'ui.bootstrap', 'controllers', 'filters', 'providers', 'httpLink'])
            .config([
                '$urlRouterProvider',
                '$stateProvider',
                '$sceProvider',
                '$locationProvider',
                '$httpProvider',
                'UriMapperProvider',
                function ($urlRouterProvider, $stateProvider, $sceProvider, $locationProvider, $httpProvider, UriMapper) {
                    // Completely disable SCE for IE7, see http://errors.angularjs.org/1.2.20/$sce/iequirks
                    $sceProvider.enabled(false);

                    //Enable cross domain calls
                    $httpProvider.defaults.useXDomain = true;
                    delete $httpProvider.defaults.headers.common['X-Requested-With'];

                    $httpProvider.defaults.withCredentials = true;

                    // We need a server that supports this to enable it.
                    $locationProvider.html5Mode(false);

                    var apiUri = $('HEAD link[rel="api"]')[0].href;
                    UriMapper.initialise(window.location.href, apiUri);

                    $urlRouterProvider.otherwise("/a/");

                    $stateProvider
                        .state('home', {
                          url: "/a/{apiUri:.*}",

                          templateUrl: 'template/home/index.html',
                          controller: 'HomeController',
                          data: {
                            rel: {
                              'self': 'home',
                              'orders': 'orders'
                            }
                          },
                          resolve: {
                            'apiRoot': ['$log', '$http', function ($log, $http) {
                              $log.info('Loading API from: ' + apiUri);
                              return $http.get(apiUri, {headers: {Accept: 'application/json'}});
                            }]
                          }
                        })

                        //.state('home', {
                        //    url: "/orders/order/a/{apiUri:.*}",
                        //
                        //    templateUrl: 'template/order/index.html',
                        //    controller: 'OrderController',
                        //    data: {
                        //        rel: {
                        //            'self': 'order',
                        //            'home': 'home',
                        //            'up': 'orders',
                        //            'pay': 'pay'
                        //        }
                        //    },
                        //    resolve: {
                        //        'apiRoot': ['$log', '$http', function ($log, $http) {
                        //            $log.info('Loading API from: ' + apiUri);
                        //            return $http.get(apiUri, {headers: {Accept: 'application/json'}});
                        //        }]
                        //    }
                        //})

                        // Orders
                        // =========
                        .state('order', {
                            url: "/orders/order/a/{apiUri:.*}",

                            templateUrl: 'template/order/index.html',
                            controller: 'OrderController',
                            data: {
                                rel: {
                                    'self': 'order',
                                    'home': 'home',
                                    'up': 'orders',
                                    'pay': 'pay'
                                }
                            }
                        })
                        .state('pay', {
                            url: "/orders/order/pay/a/{apiUri:.*}",

                            templateUrl: 'template/pay/post.html',
                            controller: 'PayController',
                            data: {
                                rel: {
                                    'self': 'pay',
                                    'home': 'home',
                                    'up': 'order'
                                }
                            }
                        })
                        .state('orders', {
                            url: "/orders/a/{apiUri:.*}",

                            templateUrl: 'template/orders/index.html',
                            controller: 'OrdersController',
                            data: {
                                rel: {
                                    'self': 'orders',
                                    'order': 'order',
                                    'home': 'home',
                                    'up': 'home'
                                }
                            }
                        });
                }])
            .run(function ($rootScope, $urlRouter, $log, $state, $location) {

                function allServices(mod, r) {
                    //var inj = angular.element(document).injector().get;
                    if (!r) r = {};
                    angular.forEach(angular.module(mod).requires, function (m) {
                        allServices(m, r);
                    });
                    angular.forEach(angular.module(mod)._invokeQueue, function (a) {
                        try {
                            r[a[2][0]] = inj(a[2][0]);
                        } catch (e) {
                        }
                    });
                    return r;
                }


                $rootScope.$on('$stateNotFound',
                    function (event, unfoundState, fromState, fromParams) {
                        $log.debug("$stateNotFound", arguments);
                    });

                /*
                 * This is very useful logging when having issues with setting the
                 * $location.path(). This can be due to asynchronous issues with
                 * setting the browser URL or it can be a routing issue.
                 *
                 * Add ?debug to the url
                 */
                if ($location.search()['debug']) {

                    $log.debug("App", angular.module('app').requires);
                    $log.debug("Controllers", angular.module('controllers')._invokeQueue);
                    $log.debug(allServices('app'));


                    $rootScope.$on('$locationChangeSuccess', function (evt) {
                        $log.debug('$locationChangeSuccess', arguments);
                    });

                    $rootScope.$on('$routeChangeStart', function (ev, to, from) {
                        $log.debug("$routeChangeStart", arguments);
                    });

                    $rootScope.$on('$stateChangeSuccess', function (ev, to, from) {
                        $log.debug("$stateChangeSuccess", arguments);
                    });

                    $rootScope.$on('$stateChangeError', function (ev, to, from, error) {
                        $log.debug("$stateChangeError", arguments);
                    });

                    $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
                        $log.debug("$stateNotFound", arguments);
                    });
                }

                //todo: is this the best place to load slidebars?
                angular.element(document).ready(function () {
                    $.slidebars();
                });

            });
        return app;

    });