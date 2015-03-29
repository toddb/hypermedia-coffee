beforeEach(function () {
    this.addMatchers({
        toEqualData: function (expected) {
            return angular.equals(this.actual, expected);
        },
        toBeDate: function () {
            return this.actual instanceof Date;
        },
        toBeSameDate: function (expected) {
            return this.actual.getTime() === expected.getTime();
        }
    });
});