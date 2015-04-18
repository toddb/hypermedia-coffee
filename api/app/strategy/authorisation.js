var neo4j = require('node-neo4j'),
    Acl = require("graph-acl"),
    Q = require('q');

var internals = {
  connection: 'http://localhost:7474'
};

/**
 * @type Acl
 */

/**
 *
 * @param {URI|String} [connectionString=http://localhost:7474] - connection to the neo4j database
 * @returns {Acl}
 * @constructor
 */
internals.Server = function (connection) {
  this.connection = connection || internals.connection;
  this.db = new neo4j(this.connection);
  this.acl = new Acl(new Acl.neo4jConnector(this.db));
}

/**
 *
 * @param connection
 * @returns {internals}
 * @constructor
 */
exports = module.exports = function (connection) {
  internals.server = new internals.Server(connection);
  internals.acl = internals.server.acl;
  return internals
};

/**
 * Creates a user and adds the user to a group of the same name
 * @param {string} user
 * @param {string?} [group=user]
 * @returns {deferred.promise|{then, catch, finally}}
 */
internals.addUser = function (user, group) {
  var deferred = Q.defer();

  internals.acl.addUserRoles(user, group || user, function (err, roles) {

    if (err) {
      deferred.reject(err)
    }
    else {
      deferred.resolve(roles);
    }
  });

  return deferred.promise;
};

/**
 * Adds a user to a group
 * @param {string|Array} user
 * @param {string\Array} group
 * @returns {deferred.promise|{then, catch, finally}}
 */
internals.addUserToGroup = function (user, group) {
  var deferred = Q.defer();

  internals.acl.addRoleParents(user, group, function (err, roles) {

    if (err) {
      deferred.reject(err)
    }
    else {
      deferred.resolve(roles);
    }
  });

  return deferred.promise;
}

/**
 *
 * @param {string|Array} user
 * @param {string|Array} resource
 * @param perms
 * @returns {deferred.promise|{then, catch, finally}}
 */
internals.allow = function (user, resource, perms) {

  var deferred = Q.defer();

  internals.acl.allow(user, resource, perms, function (err, created) {

    if (err) {
      deferred.reject(err)
    }
    else {
      deferred.resolve(created);
    }
  });

  return deferred.promise;
};

/**
 *
 * @param user
 * @param resource
 * @param perms
 * @returns {deferred.promise|{then, catch, finally}}
 */
internals.isAllowed = function (user, resource, perms) {

  var deferred = Q.defer();

  internals.acl.isAllowed(user, resource, perms, function (err, result) {

    if (err || result === false) {
      deferred.reject(err);
    }
    else {
      deferred.resolve();
    }

  });

  return deferred.promise;
}

