var expect = require('chai').expect,
    Q = require('q');

var authorisation = require('../../app/strategy/authorisation');
var auth = authorisation();

var adminUser = 'account/1';
var customer1User = 'account/2';
var customer2User = 'account/3';
var adminGroup = 'admin';
var resourceCustomer1 = 'order/1';
var resourceCustomer2 = 'order/2';


// read, write, delete
// list (read children - discover), create
// read perms, write perms (GET/PUT)
// creator, owner (GET) - only settable once
describe("One owner, admin both access to resource:", function () {

  before(function (done) {

    // these need to be sequential across three stages:
    //  users --> groups --> perms
    Q.allSettled([

      auth.addUser(adminUser, adminGroup),
      auth.addUser(customer1User),
      auth.addUser(customer2User)])

        .then(function () {

          auth.addUserToGroup(adminGroup, [customer1User, customer2User])

              .then(function () {

                Q.allSettled([
                  auth.allow([customer1User, adminGroup], resourceCustomer1, 'read'),
                  auth.allow([customer2User, adminGroup], resourceCustomer2, 'read')])

                    .then(function () {
                      done();
                    })

              })
        }
    )
  });

  describe('Resource Customer1:', function () {

    describe('Users:', function () {

      describe('Access:', function () {
        it('should allow a user see their own perms', function (done) {
          auth.isAllowed(customer1User, resourceCustomer1, 'read')
              .then(done);
        });

       });

      describe('Deny:', function () {
        it('should disallow other users to see other users perms', function (done) {
          auth.isAllowed(customer2User, resourceCustomer1, 'read')
              .then(null, function notAuthorised(err) {
                done(err);
              });
        });
      });
    });

    describe('Admin:', function () {
      it('should allow an admin to inherit users perms', function (done) {
        auth.isAllowed(adminUser, resourceCustomer1, 'read')
            .then(done);
      });
    });


  });

  describe('Resource Customer2:', function () {

    describe('Users:', function () {

      describe('Access:', function () {
        it('should allow a user see their own perms', function (done) {
          auth.isAllowed(customer2User, resourceCustomer2, 'read')
              .then(done);
        });

      });

      describe('Deny:', function () {
        it('should disallow other users to see other users perms', function (done) {
          auth.isAllowed(customer1User, resourceCustomer2, 'read')
              .then(null, function notAuthorised(err) {
                done(err);
              });
        });
      });
    });

    describe('Admin:', function () {
      it('should allow an admin to inherit users perms', function (done) {
        auth.isAllowed(adminUser, resourceCustomer2, 'read')
            .then(done);
      });
    });

  });

});

