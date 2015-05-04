var _ = require('underscore')
    , fluent = function (methodBody) {
      return function () {
        methodBody.apply(this, arguments);
        return this;
      }
    };

/**
 *  @example
 *
 * function(doc){
 *    return {
 *      id: url + doc._id,
        title: doc.type
 *    };
 * }
 *
 * @callback LinkPredicate
 * @param {object} doc
 */

/**
 * @example
 * var representation = new Representation('http://example.com/api', {});
 *
 * Output:
 *
 * {
 *  links: [
 *    { rel: 'self', href: 'http://example.com/api', type:'application/json'}
 * ]}
 *
 *
 *
 * @param {string} url The uri of the relationship
 * @param {object} doc The resource document
 * @param {?LinkPredicate} itemLink Callback that must return an object with {id:string, title:string}
 * @constructor
 */
function Representation(url, doc, itemLink) {

  this.links = [];

  this.selfLink(url);

  if (_.isUndefined(doc))
    return

  if (_.isArray(doc)) {
    this.addCollection(url, doc, itemLink);
  } else {
    _.each(doc.toJSON ? doc.toJSON() : doc, function (v, k) {
      this[k] = v;
    }, this);
  }
}

/**
 * Adds a link relation to `links`
 *
 * @example
 *
 *  representation.addLink('up', 'http://example.com/order/');
 *
 * Output:
 *
 * links: [
 *  { rel: 'self' ... would already exist },
 *  { rel: 'up', href: 'http://example.com/order/', type: 'application/json' }
 * ]
 *
 * @param {String} relationshipType
 * @param {?String} [mediaType=application/json]
 * @return {String} url The uri of the relationship
 */
Representation.prototype.addLink = fluent(function (relationshipType, mediaType, url) {
  if (_.isUndefined(mediaType))
    return

  if (_.isUndefined(url)) {
    url = mediaType;
    mediaType = 'application/json';
  }

  this.links.push({rel: relationshipType, type: mediaType, href: url});
});

/**
 * @callback RelationshipTypeCallback
 * @param {string} relationshipType
 */
/**
 * Adds multiple link relations to `links`
 *
 * @example
 *
 *   // url is already http://example.com/order/123/
 *   rels = ['pay']
 *   representation.addLinks(rels, function (rel) {
 *     return url + rel;
 *   })
 *
 * Output:
 *
 * links: [
 *  { rel: 'self' ... would already exist },
 *  { rel: 'pay', href: 'http://example.com/order/123/pay', type: 'application/json' }
 * ]
 *
 *
 * @param {Array.<string>} transition
 * @param {RelationshipTypeCallback} fn
 */
Representation.prototype.addLinks = fluent(function (transition, fn) {
  var _this = this;
  _.each(transition, function (relationshipType) {
    _this.addLink(relationshipType, fn(relationshipType));
  });
});

/**
 * Adds a self link
 *
 * @example
 *
 * representation.selfLink(url);
 *
 * Output:
 *
 * links: [
 *  { rel: 'self', href: 'http://example.com/api/', type: 'application/json' },
 * ]
 *
 * @param {string} url The uri of the relationship
 * @private
 */
Representation.prototype.selfLink = fluent(function (url) {
  this.addLink('self', url);
});

/**
 *  @example
 *
 * function(doc){
 *    return {
 *      id: url + doc._id,
        title: doc.type
 *    };
 * }
 *
 * @callback LinkPredicate
 * @param {object} doc
 */

/**
 * Add a collection to the `items`
 *
 * @example
 *
 * representation.addCollection(url, []);
 *
 * Output:
 *
 * links: [
 *  { rel: 'self', href: 'http://example.com/api/', type: 'application/json' },
 * ]
 *
 * @param {string} url The uri of the relationship
 * @param {Array.<Object>} docs The list of resources
 * @param {?LinkPredicate} fn Callback that must return an object with {id:string, title:string}
 */
Representation.prototype.addCollection = fluent(function (url, docs, itemLink) {
  if (_.isUndefined(url))
    return;

  if (_.isEmpty(docs))
    return;

  if (_.isUndefined(itemLink)) {
    itemLink = function (doc) {
      return {
        id: url + doc._id,
        title: doc.type
      };
    }
  }
  this.items = [];
  _.each(docs, function (doc) {
    this.items.push(itemLink(doc));
  }, this);

});

/**
 * Returns the representation
 */
Representation.prototype.toJSON = fluent(function () {
});

module.exports = exports = Representation;