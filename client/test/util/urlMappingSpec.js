define(['underscore', 'util/uriMapping', 'mocks'], function (_, UriMapping) {
    var uriMapping = UriMapping;

    describe("Has Loaded", function () {
        it("Uri Mapping", function () {
            expect(uriMapping).toBeDefined();
            expect(_(uriMapping).isFunction()).toEqual(true);
        });
    });

    describe("API and client app with trailing slash", function () {

        var apiUri = 'https://api.example.com/';
        var clientUri = 'https://client.example.com/';
        var mapper = new uriMapping(clientUri, apiUri);

        describe("Root", function () {
            var sitePrefix = '';

            it("Api URI to site path", function () {
                expect(mapper.toSitePath('', '')).toEqual('');
            });

            it("Make api URI from site path", function () {
                expect(mapper.fromSitePath('', '')).toEqual(apiUri);
            });
        });

        describe("Simple item", function () {
            var sitePrefix = '/list';

            it("Api URI to site path", function () {
                expect(mapper
                    .toSitePath('https://api.example.com/category', sitePrefix))
                    .toEqual('/list/category');
            });

            it("Make api URI from site path", function () {
                expect(mapper
                    .fromSitePath('/list/category', sitePrefix))
                    .toEqual('https://api.example.com/category');
            });
        });

        describe("Nested item", function () {
            var sitePrefix = '/vendor';

            it("Api URI to site path", function () {
                expect(mapper
                    .toSitePath('https://api.example.com/category/1cg5d', sitePrefix))
                    .toEqual('/vendor/category/1cg5d');
            });

            it("Make api URI from site path", function () {
                expect(mapper
                    .fromSitePath('/vendor/category/1cg5d', sitePrefix))
                    .toEqual('https://api.example.com/category/1cg5d');
            });
        });


        describe("Collection", function () {
            var sitePrefix = '/coupons/a/';

            it("Api URI to site path", function () {

                expect(mapper
                    .toSitePath('https://api.example.com/coupon/', sitePrefix))
                    .toEqual('/coupons/a/coupon/');
            });

            it("Make api URI from site path", function () {
                expect(mapper
                    .fromSitePath('/coupons/a/coupon/', sitePrefix))
                    .toEqual('https://api.example.com/coupon/');
            });
        });


    })

    describe("API and client app without trailing slash", function () {
        var sitePrefix = '/coupons/a/';
        var clientUri = 'https://client.example.com:63352';
        var apiUri = 'https://api.example.com:8080';
        var mapper = new uriMapping(clientUri, apiUri);

        it("Api URI to site path", function () {

            expect(mapper
                .toSitePath('https://api.example.com:8080/coupon/', sitePrefix))
                .toEqual('/coupons/a/coupon/');
        });

        it("Make api URI from site path", function () {
            expect(mapper
                .fromSitePath('/coupons/a/coupon/', sitePrefix))
                .toEqual('https://api.example.com:8080/coupon/');
        });
    });

    describe("API and client app not in the root", function () {
        var sitePrefix = '/vendor';
        var apiUri = 'https://api.example.com/api';
        var clientUri = 'https://client.example.com/application';
        var mapper = new uriMapping(clientUri, apiUri);

        it("Api URI to site path", function () {
            expect(mapper
                .toSitePath('https://api.example.com/api/category/1cg5d', sitePrefix))
                .toEqual('/vendor/category/1cg5d');
        });

        it("Make api URI from site path", function () {
            expect(mapper
                .fromSitePath('/vendor/category/1cg5d', sitePrefix))
                .toEqual('https://api.example.com/api/category/1cg5d');
        });
    });


});