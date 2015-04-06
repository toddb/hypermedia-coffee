var _ = require('underscore')
    , fluent = function (methodBody) {
      return function () {
        methodBody.apply(this, arguments);
        return this;
      }
    };

function Representation(url, doc) {

  this.links = [];

  this.selfLink(url);

  if (_.isUndefined(doc))
    return

  if (_.isArray(doc)) {
    this.addCollection(url, doc);
  } else {
    _.each(doc.toJSON ? doc.toJSON() : doc, function (v, k) {
      this[k] = v;
    }, this);
  }
}

Representation.prototype.addLink = fluent(function (rel, type, url) {
  if (_.isUndefined(type))
    return

  if (_.isUndefined(url)) {
    url = type;
    type = 'application/json';
  }

  this.links.push({rel: rel, type: type, href: url});
});

Representation.prototype.addLinks = fluent(function (transition, fn) {
  var _this = this;
  _.each(transition, function (rel) {
    _this.addLink(rel, fn(rel));
  });
});

Representation.prototype.selfLink = fluent(function (url) {
  this.addLink('self', url);
});

Representation.prototype.addCollection = fluent(function (url, docs) {
  if (_.isUndefined(url))
    return;

  if (_.isEmpty(docs))
    return;

  this.items = [];
  _.each(docs, function (doc) {
    this.items.push({
      id: url + doc._id,
      title: doc.type
    });
  }, this);

});

Representation.prototype.toJSON = fluent(function () {
});

module.exports = exports = Representation;