define(['mocks', 'src/scripts/filter/timeago-filter'], function () {

    describe('Timeago filter', function () {

        beforeEach(module('filters'));

        it('should load', inject(function ($filter) {
                expect($filter('timeago')).not.toBeNull();
            }
        ));

        it('convert undefined or empty to no string', inject(function (timeagoFilter) {
                expect(timeagoFilter("")).toBe("");
                expect(timeagoFilter(null)).toBe("");
                expect(timeagoFilter(undefined)).toBe("");
            }
        ));

        it('convert undefined or empty to no string', inject(function (timeagoFilter) {
                var future = new Date();
                future.setDate(future.getDate() + 25);
                expect(timeagoFilter(future)).toBe("25 days from now");
            }
        ));

    });
});