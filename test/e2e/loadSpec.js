/*global browser sleep element describe beforeEach afterEach it expect using */

var Homepage = function () {
  this.username = element(by.id('inputEmail'));
  this.password = element(by.id('inputPassword'));

  this.get = function () {
    browser.get('/');
  };

  this.login = function (name, password) {
    expect(element(by.id('inputEmail')).isDisplayed()).toBe(true);
    element(by.id('inputEmail')).sendKeys(name || 'bob');
    element(by.id('inputPassword')).sendKeys(password || 'secret');
    element(by.id('login')).submit();
  };

  this.logout = function () {
    element(by.id("logout")).submit();
  };
};

describe('Coffee Application - unauthenticated', function () {

  var app = new Homepage();

  beforeEach(function () {
    app.get();
    app.login();
  });

  afterEach(function () {
    app.logout();
  });

  it('should have a logged in user', function () {
//    browser.sleep(2000); // so you can see that it is logged in
    expect(element(by.css("body")).getText()).toContain("Making Coffee for You!");
  });

  it('should be able to add an order', function () {
    element(by.repeater('option in options').row(0)).click();
    element(by.id('orderNow')).click();
//    browser.sleep(3000)
  });

});

