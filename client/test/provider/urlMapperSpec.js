define(['mocks', 'src/scripts/provider/uriMapper'], function (angular) {

    describe('TestUriMapperProvider must be configured', function () {

        beforeEach(module('providers', function (UriMapperProvider) {
            UriMapperProvider.initialise("siteuri", "apiuri");
        }));

        it('should return methods', inject(function (UriMapper) {
                expect(UriMapper.toSitePath).not.toBeUndefined();
                expect(UriMapper.fromSitePath).not.toBeUndefined();
                expect(UriMapper.toSitePath("apiuri/a", "b")).toEqual("b/a");
            }
        ));

    });
});