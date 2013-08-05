/*global browser sleep element describe beforeEach afterEach it expect using */

angular.scenario.dsl('login', function () {
  return function (name, password) {
    if (element(":submit[value*='Sign In']", "sign in") != undefined) {
      input('username').enter(name || 'bob');
      input('password').enter(password || 'secret')
      element(":submit[value*='Sign In']").click();
    }
  };
});

angular.scenario.dsl('logout', function () {
  return function () {
    element(":submit[value*='Log out (bob)']").click();
  };
});

describe('Coffee Application - unauthenticated', function () {
  beforeEach(function () {
    browser().navigateTo('/');
    login();
  });

  afterEach(function () {
    logout();
  })

  it('should automatically redirect to / when location hash/fragment is empty', function () {
    expect(browser().location().url()).toBe("/");
    expect(browser().location().hash()).toBe("");
  });

  it('should have a logged in user', function () {
    expect(element(":submit[value*='Log out (bob)']").val()).toEqual("Log out (bob)");
  });

  it('should be able to order a coffee', function () {
//    select('newOrder.type').option('Medium')
  });

});
