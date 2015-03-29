var _ = require('underscore')
    , fluent = function (methodBody) {
      return function () {
        methodBody.apply(this, arguments);
        return this;
      }
    };

function Resource(url, doc) {
  // TODO: doc could be Array[ID]
  // TODO: __type could be defaulted to application/json in ctor and then excluded in toJSON
  this.links = [];

  this.selfLink(url);

  if (_.isUndefined(doc))
    return

  if (_.isArray(doc)) {
    this.collectionLinks(url, doc);
    this.addCollection(url, doc);
  } else {
    _.each(doc.toJSON ? doc.toJSON() : doc, function (v, k) {
      this[k] = v;
    }, this);
  }
}

Resource.prototype.addLink = fluent(function (rel, type, url) {
  if (_.isUndefined(type))
    return

  if (_.isUndefined(url)) {
    url = type;
    type = 'application/json';
  }

  this.links.push({rel: rel, type: type, href: url});
});

Resource.prototype.selfLink = fluent(function (url) {
  this.addLink('self', url);
});

Resource.prototype.collectionLinks = fluent(function (url, docs) {
  if (_.isUndefined(url))
    return;

  if (_.isEmpty(docs))
    return;

  this.addLink('first', url + _.first(docs)._id);
  this.addLink('last', url + _.last(docs)._id);
  _.each(docs, function (doc) {
    this.addLink('item', url + doc._id);
  }, this);

});

Resource.prototype.addCollection = fluent(function (url, docs) {
  if (_.isUndefined(url))
    return;

  if (_.isEmpty(docs))
    return;

  this.items = [];
  _.each(docs, function (doc) {
    this.items.push({
      id: url +  doc._id,
      title: doc.type
    });
  }, this);

});

Resource.prototype.toJSON = fluent(function () {
});

module.exports = exports = Resource;