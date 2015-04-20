var neo4j = require('node-neo4j'),
    Acl = require("graph-acl"),
    Q = require('q'),
    perms = require('./perms');

/**
 *
 * @type {{connection: string}}
 */
var internals = {
  connection: 'http://localhost:7474'
};

/**
 *
 * @param {URI|String} [connection=http://localhost:7474] - connection to the neo4j database
 * @type {Authorisation}
 * @constructor
 */
var Authorisation = function (connection) {
  internals.server = new internals.Server(connection);
  this.acl = internals.server.acl;
};

/**
 *
 * @param {URI|String} [connectionString=http://localhost:7474] - connection to the neo4j database
 * @returns {internals.Server}
 * @constructor
 */
internals.Server = function (connection) {
  this.connection = connection || internals.connection;
  this.db = new neo4j(this.connection);
  this.acl = new Acl(new Acl.neo4jConnector(this.db));
}

/**
 *
 * @type {Authorisation|Function}
 */
exports = module.exports = function(connection){
  return new Authorisation(connection);
};

/**
 *
 * @type {{permissions: *[], READ: string, WRITE: string, DELETE: string, LIST: string, CREATE: string, READ_PERMS: string, WRITE_PERMS: string, CREATOR: string, OWNER: string}}
 */
exports.perms = perms;

/**
 * Creates a user and adds the user to a group of the same name
 * @param {string} user
 * @param {string?} [group=user]
 * @returns {deferred.promise|{then, catch, finally}}
 */
Authorisation.prototype.addUser = function (user, group) {
  var deferred = Q.defer();

  this.acl.addUserRoles(user, group || user, function (err, roles) {

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
Authorisation.prototype.addUserToGroup = function (user, group) {
  var deferred = Q.defer();

  this.acl.addRoleParents(user, group, function (err, roles) {

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
Authorisation.prototype.allow = function (user, resource, perms) {

  var deferred = Q.defer();

  this.acl.allow(user, resource, perms, function (err, created) {

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
 * Is a user allow access to a resource based a full set of perms.
 *
 * Note: the underlying implementation only returns on a full match
 *
 * @param user
 * @param resource
 * @param perms
 * @returns {deferred.promise|{then, catch, finally}}
 */
Authorisation.prototype.isAllowed = function (user, resource, perms) {

  var deferred = Q.defer();

  this.acl.isAllowed(user, resource, perms, function (err, result) {

    if (err || result === false) {
      deferred.reject(err);
    }
    else {
      deferred.resolve();
    }

  });

  return deferred.promise;
}

