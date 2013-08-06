/*global describe beforeEach it expect inject module angular $ */
define(['chai', 'mocks', 'services/httpLink'],
    function (chai) {

        'use strict';

        var should = chai.should()
            , link;

        describe('services/httpLink', function () {

            beforeEach(module('httpLink'));

            beforeEach(inject(function (_link_) {
                link = _link_;
            }));

            beforeEach(function () {
                $('<link rel="collection" type="text/html" href="http://semanticlink-test">').prependTo('HEAD');
            });

            describe('HEAD - filter the starting point based on link rel and type', function () {

                it("should filter links", function () {
                    link.filter('HEAD', 'collection', 'text/html').should.deep.equal([
                        { href: 'http://semanticlink-test/', rel: 'collection', type: 'text/html' }
                    ]);
                });

                it("filters links", function () {
                    link.filter($('head')[0], 'collection', 'text/html').should.deep.equal([
                        { href: 'http://semanticlink-test/', rel: 'collection', type: 'text/html' }
                    ]);
                });

            });

            describe('GetUri', function () {
                it("should get href uri", function () {
                    link.getUrl('HEAD', 'collection', 'text/html').should.equal('http://semanticlink-test/');
                });
                it("should not find Uri", function () {
                    link.getUrl('HEAD', 'self', 'text/html').should.equal('');
                });
            });

            describe('LINKS', function () {
                beforeEach(function () {
                    this.links = [
                        { rel: "alternate", type: "text/html", href: "http://sl/order/1" },
                        { rel: "alternate", type: "application/json", href: "http://sl/order1" },
                        { rel: "notes", type: "application/json", href: "http://sl/order/1/note/"},
                        { rel: "collection", type: "application/json", href: "http://sl/orders/"},
                        { rel: "first", type: "application/json", href: "http://sl/order/1"},
                        { rel: "last", type: "application/json", href: "http://sl/order/5" }
                    ];
                });

                it("filters on string match", function () {
                    link.filter(this.links, 'notes', 'application/json').length.should.equal(1);
                    link.filter(this.links, 'alternate', 'application/json').length.should.equal(1);
                    link.filter(this.links, 'alternate', 'text/html').length.should.equal(1);
                    link.filter(this.links, 'alternate', 'text/css').length.should.equal(0);
                });

                it("filters on * wildcard", function () {
                    link.filter(this.links, 'alternate', '*').length.should.equal(2);
                    link.filter(this.links, '*', 'application/json').length.should.equal(5);
                    link.filter(this.links, '*', '*').length.should.equal(6);
                });

                it("filters on regular expression", function () {
                    link.filter(this.links, /alternate/i, "*").length.should.equal(2);
                    link.filter(this.links, /cancel/i, "*").length.should.equal(0);
                    link.filter(this.links, '*', /application/i).length.should.equal(5);
                    link.filter(this.links, '*', /html/i).length.should.equal(1);
                });

            });

            describe('matches', function () {
                beforeEach(function () {
                    this.links = [
                        { rel: "alternate", type: "text/html", href: "http://sl/order/1" },
                        { rel: "alternate", type: "application/json", href: "http://sl/order1" },
                        { rel: "notes", type: "application/json", href: "http://sl/order/1/notes"},
                        { rel: "collection", type: "application/json", href: "http://sl/orderss"},
                        { rel: "first", type: "application/json", href: "http://sl/order/1"},
                        { rel: "last", type: "application/json", href: "http://sl/order/5" }
                    ];
                });

                it("filters on string match", function () {
                    link.matches(this.links, 'notes', 'application/json').should.equal(true);
                    link.matches(this.links, 'alternate', 'application/json').should.equal(true);
                    link.matches(this.links, 'alternate', 'text/html').should.equal(true);
                    link.matches(this.links, 'alternate', 'text/css').should.equal(false);
                });

                it("filters on * wildcard", function () {
                    link.matches(this.links, 'alternate', '*').should.equal(true);
                    link.matches(this.links, '*', 'application/json').should.equal(true);
                    link.matches(this.links, '*', '*').should.equal(true);
                });

                it("filters on regular expression", function () {
                    link.matches(this.links, /alternate/i, "*").should.equal(true);
                    link.matches(this.links, /cancel/i, "*").should.equal(false);
                    link.matches(this.links, '*', /application/i).should.equal(true);
                    link.matches(this.links, '*', /html/i).should.equal(true);
                });

            });

            describe('HTTP', function () {
                var httpMock, success, failure;
                beforeEach(inject(function (_$httpBackend_) {
                    httpMock = _$httpBackend_;
                }));

                describe("returns a promise", function () {
                    beforeEach(function () {
                        success = jasmine.createSpy("Resource");
                        failure = jasmine.createSpy("Fail Resource");
                    });

                    it('should do request based on href (200,204) and return to done', function () {
                        httpMock.expectGET(/semanticlink-test/).respond(204);

                        link.get("HEAD", 'collection', 'text/html').
                            then(success, failure);
                        httpMock.flush();
                        expect(success).toHaveBeenCalled();
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should fail if bad request (500) and return to fail', function () {
                        httpMock.expectGET(/semanticlink-test/).respond(500);
                        link.get("HEAD", 'collection', 'text/html').
                            then(success, failure);
                        httpMock.flush();
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });

                describe('Verbs', function () {

                    beforeEach(function () {
                        this.resource = {
                            "links": [
                                { rel: "collection", type: "application/json", href: "http://sl/orders/"},
                                { rel: "self", type: "application/json", href: "http://sl/orders/1"}
                            ],
                            type: "small"
                        };
                    });

                    describe('GET collection accept-type', function () {
                        it('should call server', function () {
                            httpMock.expectGET(/semanticlink-test/).respond(204);
                            link.get("HEAD", 'collection', 'text/html');
                            httpMock.flush();
                        });
                    });

                    describe('POST collection accept-type', function () {
                        it('should call server', function (done) {
                            httpMock.expectPOST(/orders\//).respond(204, {Location: 'somewhere'});
                            link.post(this.resource, 'collection', 'application/json', { type: 'small'});
                            httpMock.flush();
                        });
                    });

                    describe('PUT item accept-type', function () {
                        it('should call server', function (done) {
                            httpMock.expectPUT(/orders\/1/).respond(204, {Location: 'somewhere'});
                            link.put(this.resource, 'self', 'application/json', { type: 'small'});
                            httpMock.flush();
                        });
                    });

                    describe('DELETE item accept-type', function () {
                        it('should call server', function (done) {
                            httpMock.expectDELETE(/orders\/1/).respond(204);
                            link.del(this.resource, 'self', 'application/json');
                            httpMock.flush();
                        });
                    });
                });

            });

            afterEach(function () {
                $('link[rel="collection"]').remove();
            });

        });

    }
);
