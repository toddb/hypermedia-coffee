beforeEach(function () {
  this.addMatchers({
    toEqualData:function (expected) {
      return angular.equals(this.actual, expected);
    }
  });
});