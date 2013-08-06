/*global describe beforeEach it expect inject module */
define(['mocks', 'services/httpAuthInterceptor'], function () {
    'use strict';

    describe('httpAuthenticator', function () {

        var service, scope, $httpBackend, $http
            , pass, fail;

        beforeEach(module('http-auth-interceptor'));

        beforeEach(inject(function (_$httpBackend_, _$http_, $rootScope, authService) {
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            service = authService;
            scope = $rootScope;
        }));

        beforeEach(function () {
            pass = jasmine.createSpy("authenticated");
            fail = jasmine.createSpy("unauthenticated");

            /*
             * traps this event to then get next request on login
             */
            scope.$on('event:auth-loginRequired', function () {
                service.loginConfirmed();
            });
        });

        it('should succeed on 200', function () {
            $httpBackend.whenGET('/order/').respond(200, 'a');

            $http.get('/order/').
                success(function (data, status, headers, config) {
                    pass(data, status, headers(), config.method, config.url, config.headers);
                }).
                error(fail);

            $httpBackend.flush();

            expect(pass).toHaveBeenCalledWith('a', 200, {}, 'GET', '/order/', { Accept: 'application/json, text/plain, */*' });
            expect(fail).not.toHaveBeenCalled();
        });

        it('should pass through after first auth error and then second provides authorised', function () {
            $httpBackend.expectGET('/order/').respond(401);
            $httpBackend.expectGET('/order/').respond(200);

            $http.get('/order/').
                success(pass).
                error(fail);

            $httpBackend.flush();

            expect(pass).toHaveBeenCalled();
            expect(fail).not.toHaveBeenCalled();
        });

        it('should pass through to error when 500', function () {
            $httpBackend.whenGET('/order/').respond(500);

            $http.get('/order/').
                success(pass).
                error(function (data, status, headers, config) {
                    fail(status, headers(), config.method, config.url, config.headers);
                });

            $httpBackend.flush();

            expect(pass).not.toHaveBeenCalled();
            expect(fail).toHaveBeenCalledWith(500, {}, 'GET', '/order/', { Accept: 'application/json, text/plain, */*' });

        });
    });
});