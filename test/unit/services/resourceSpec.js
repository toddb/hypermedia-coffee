/*global describe beforeEach it expect inject module */

define(['mocks', 'services/resource'], function () {
    'use strict';

    describe('Resource', function () {

        var service, httpMock;

        beforeEach(module('app.services'));

        beforeEach(inject(function (_$httpBackend_, Resource) {
            httpMock = _$httpBackend_;
            service = Resource;
        }));

        it('instantiates', function () {
            expect(service).not.toBeNull();
        });

        describe('PUT', function () {
            beforeEach(function () {
                httpMock.expectPUT('/order/1', {type: 'large'}, {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=utf-8"
                }).respond(204);
            });
            it('SUCCESS - calls xhr', function () {
                var spy = jasmine.createSpy('PUT');

                service.put({ links: [
                    { rel: 'self', href: "/order/1", type: "application/json"}
                ]}, 'self', 'application/json', {type: 'large'}).
                    then(function success(config) {
                        spy(config.status);
                    });
                httpMock.flush();

                expect(spy).toHaveBeenCalledWith(204);
            });
        });

        describe('POST', function () {
            beforeEach(function () {
                httpMock.expectPOST("/order/", {"type": "med"}, {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=utf-8"
                }).
                    respond(204, {}, {Location: "/order/1"});
                httpMock.expectGET("/order/1").respond({
                        links: [
                            { rel: "viewstate", href: "/order/1/viewstate/current", type: 'application/json'}
                        ],
                        type: "med"},
                    {Allow: 'GET,PUT,DELETE'}
                );
            });

            it('SUCCESS - calls xhr, returns 204 and GET Location', function () {
                var spy = jasmine.createSpy('POST');

                service.post({ links: [
                    { rel: 'self', href: "/order/", type: "application/json"}
                ]}, 'self', 'application/json', {type: 'med'})
                    .then(function (item) {
                        spy(item.data);
                    });
                httpMock.flush();

                expect(spy).toHaveBeenCalledWith(
                    { links: [
                        { rel: 'viewstate', href: '/order/1/viewstate/current', type: 'application/json' }
                    ],
                        type: 'med'
                    }
                );
            });
        });

        describe('DELETE', function () {
            beforeEach(function () {
                httpMock.expectDELETE('/order/1', {Accept: "application/json"}).respond(204);
            });

            it('SUCCESS - calls xhr', function () {
                var spy = jasmine.createSpy('DELETE');

                service.del({ links: [
                    { rel: 'self', href: "/order/1", type: "application/json"}
                ]}, 'self')
                    .then(function (result) {
                        spy(result.status);
                    });
                httpMock.flush();
                expect(spy).toHaveBeenCalledWith(204);
            });
        });

        describe("GET", function () {

            describe('string - item', function () {
                it('STRING GET', function () {
                    var success = jasmine.createSpy('Success')
                        , failure = jasmine.createSpy('Error')
                        , resource = { links: [
                            { rel: 'item', href: "/order/1", type: "application/json"}
                        ]};
                    httpMock.expectGET('/order/1', {Accept: "application/json"}).respond({});

                    service.get(resource, "item", "application/json").
                        then(success, failure);
                    httpMock.flush();

                    expect(success).toHaveBeenCalled();
                    expect(failure).not.toHaveBeenCalled();
                })
            });

            describe('JSON - one-deep item', function () {
                it('item --> item', function () {
                    var success = jasmine.createSpy('item')
                        , failure = jasmine.createSpy('error')
                        , resource = { links: [
                            { rel: 'viewstate', href: "/order/1/viewstate", type: "application/json"}
                        ]};

                    httpMock.expectGET('/order/1/viewstate', {Accept: "application/json"}).respond(
                        {
                            links: [
                                {rel: 'current', href: "/order/1/viewstate/1", type: "application/json"}
                            ]
                        });
                    httpMock.expectGET('/order/1/viewstate/1', {Accept: "application/json"}).respond({some: 'data'});

                    service.get(resource, { viewstate: 'current' }, 'application/json').
                        then(function (response) {
                            success(response.data);
                        }, failure);

                    httpMock.flush();

                    expect(success).toHaveBeenCalledWith({some: 'data'});
                    expect(failure).not.toHaveBeenCalled();
                });
            });

            describe('JSON - collection with viewstate', function () {

                describe('generate collection resource of orders --> order (1) --> viewstate current', function () {

                    var dataElement, links, resource;
                    beforeEach(function () {
                        dataElement = jasmine.createSpy('Data Element');
                        links = jasmine.createSpy('Links');
                        resource = { links: [
                            { rel: 'collection', href: "/order/", type: "application/json"}
                        ]};
                    });
                    beforeEach(function () {
                        httpMock.expectGET('/order/', {Accept: "application/json"}).respond(
                            {
                                links: [
                                    {rel: 'self', href: "/order/", type: "application/json"},
                                    {rel: 'item', href: "/order/1", type: "application/json"}
                                ]
                            }, {Allow: 'GET,POST'});
                        httpMock.expectGET('/order/1').respond(
                            {
                                links: [
                                    {rel: 'viewstate', href: "/order/1/viewstate/current", type: "application/json"}
                                ],
                                type: 'med'
                            }, {Allow: 'GET,PUT,DELETE'});
                        httpMock.expectGET('/order/1/viewstate/current').respond(
                            {
                                links: [
                                    {rel: 'self', href: "/order/1/viewstate/1", type: "application/json"}
                                ],
                                updateable: true,
                                deleteable: true,
                                createable: true,
                                editable: false
                            }, {Allow: 'GET'});
                    });

                    it('JSON GET', function () {
                        service.get(resource, {
                            collection: [
                                { item: { viewstate: {} }}
                            ]
                        }).
                            then(function (response) {
                                dataElement(response.data.item);
                                links(response.data.links);
                            });
                        httpMock.flush();

                        expect(dataElement).toHaveBeenCalledWith(
                            [
                                {
                                    links: [
                                        { rel: 'viewstate', href: '/order/1/viewstate/current', type: 'application/json' }
                                    ],
                                    type: 'med',
                                    viewstate: {
                                        links: [
                                            { rel: 'self', href: '/order/1/viewstate/1', type: 'application/json' }
                                        ],
                                        updateable: true,
                                        deleteable: true,
                                        createable: true,
                                        editable: false
                                    }
                                }
                            ]);
                        expect(links).toHaveBeenCalledWith(
                            [
                                {rel: 'self', href: "/order/", type: "application/json"},
                                {rel: 'item', href: '/order/1', type: 'application/json'}
                            ]);
                    });
                });

                describe('generate collection resource of orders --> order (2) --> viewstate current', function () {

                    var dataElement, links, resource;
                    beforeEach(function () {
                        dataElement = jasmine.createSpy('Data Element');
                        links = jasmine.createSpy('Links');
                        resource = { links: [
                            { rel: 'collection', href: "/order/", type: "application/json"}
                        ]};
                    });
                    beforeEach(function () {
                        httpMock.expectGET('/order/', {Accept: "application/json"}).respond(
                            {
                                links: [
                                    {rel: 'self', href: "/order/", type: "application/json"},
                                    {rel: 'item', href: "/order/1", type: "application/json"},
                                    {rel: 'item', href: "/order/2", type: "application/json"}
                                ]
                            }, {Allow: 'GET,POST'});
                        httpMock.expectGET('/order/1').respond(
                            {
                                links: [
                                    {rel: 'viewstate', href: "/order/1/viewstate/current", type: "application/json"}
                                ],
                                type: 'med'
                            }, {Allow: 'GET,PUT,DELETE'});
                        httpMock.expectGET('/order/2').respond(
                            {
                                links: [
                                    {rel: 'viewstate', href: "/order/2/viewstate/current", type: "application/json"}
                                ],
                                type: 'large'
                            }, {Allow: 'GET,PUT,DELETE'});
                        httpMock.expectGET('/order/1/viewstate/current').respond(
                            {
                                links: [
                                    {rel: 'self', href: "/order/1/viewstate/1", type: "application/json"}
                                ],
                                updateable: true,
                                deleteable: true,
                                createable: true,
                                editable: false
                            }, {Allow: 'GET'});
                        httpMock.expectGET('/order/2/viewstate/current').respond(
                            {
                                links: [
                                    {rel: 'self', href: "/order/2/viewstate/2", type: "application/json"}
                                ],
                                updateable: true,
                                deleteable: true,
                                createable: true,
                                editable: false
                            }, {Allow: 'GET'});
                    });

                    it('JSON GET', function () {
                        service.get(resource, {
                            collection: [
                                { item: { viewstate: {} }}
                            ]
                        }).
                            then(function (response) {
                                dataElement(response.data.item);
                                links(response.data.links);
                            });
                        httpMock.flush();

                        expect(dataElement).toHaveBeenCalledWith(
                            [
                                {
                                    links: [
                                        { rel: 'viewstate', href: '/order/1/viewstate/current', type: 'application/json' }
                                    ],
                                    type: 'med',
                                    viewstate: {
                                        links: [
                                            { rel: 'self', href: '/order/1/viewstate/1', type: 'application/json' }
                                        ],
                                        updateable: true,
                                        deleteable: true,
                                        createable: true,
                                        editable: false
                                    }
                                },
                                {
                                    links: [
                                        { rel: 'viewstate', href: '/order/2/viewstate/current', type: 'application/json' }
                                    ],
                                    type: 'large',
                                    viewstate: {
                                        links: [
                                            { rel: 'self', href: '/order/2/viewstate/2', type: 'application/json' }
                                        ],
                                        updateable: true,
                                        deleteable: true,
                                        createable: true,
                                        editable: false
                                    }
                                }
                            ]);
                        expect(links).toHaveBeenCalledWith(
                            [
                                {rel: 'self', href: "/order/", type: "application/json"},
                                {rel: 'item', href: '/order/1', type: 'application/json'},
                                {rel: 'item', href: '/order/2', type: 'application/json'}
                            ]);
                    });
                });

            });
        });

    });

});