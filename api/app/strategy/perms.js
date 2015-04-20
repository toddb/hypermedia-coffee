/**
 * The default permissions and permission hierarchy if a custom one isn't passed in
 */

// read, write, delete
// list (read children - discover), create
// read perms, write perms (GET/PUT)
// creator, owner (GET) - only settable once

/**
 * Has `read` access to the resource
 *
 * @example GET on collection or item
 *
 * @type {string}
 */
var READ = 'READ';
/**
 * Has `write` access to the resource
 *
 * @example PUT on item
 * @type {string}
 */
var WRITE = 'WRITE';
/**
 * Has `delete` access on resource
 *
 * @example DELETE on item
 *
 * @type {string}
 */
var DELETE = 'DELETE';
/**
 * Is able to `list` all the all items in a collection
 *
 * @example GET collection
 *
 * @type {string}
 */
var LIST = 'LIST';
/**
 * Is able to `create` a resource
 *
 * @example POST on collection
 *
 * @type {string}
 */
var CREATE = 'CREATE';
/**
 * Is able to `read permissions` of a resource
 *
 * @type {string}
 */
var READ_PERMS = 'READ_PERMS';
/**
 * Is able to `write permissions` of a resource
 *
 * @type {string}
 */
var WRITE_PERMS = 'WRITE_PERMS';
/**
 * Is the `creator` of the resource
 *
 * @type {string}
 */
var CREATOR = 'CREATOR';
/**
 * Is the `owner` of the resources. This perm is only able to be set once.
 *
 * @type {string}
 */
var OWNER = 'OWNER';


var Permissions = [READ, WRITE, DELETE, LIST, CREATE, READ_PERMS, WRITE_PERMS, CREATOR, OWNER];


/**
 *
 * @type {{permissions: *[], READ: string, WRITE: string, DELETE: string, LIST: string, CREATE: string, READ_PERMS: string, WRITE_PERMS: string, CREATOR: string, OWNER: string}}
 */
module.exports = {
  permissions: Permissions,
  READ: READ,
  WRITE: WRITE,
  DELETE: DELETE,
  LIST: LIST,
  CREATE: CREATE,
  READ_PERMS: READ_PERMS,
  WRITE_PERMS: WRITE_PERMS,
  CREATOR: CREATOR,
  OWNER: OWNER
};