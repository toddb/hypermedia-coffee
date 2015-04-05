var _ = require('underscore')
  , Resource = require('../../representation/index').json;

module.exports = exports = function resourcePlugin(schema, options) {

  schema.statics.post = function (model, cb) {

    this._save = this.saveVersion ? this.saveVersion : this.create;
    model = this.saveVersion ? {data: model} : model;

    this._save(model, function (err, doc) {
      if (err) cb(err);
      if (_.isUndefined(doc) || _.isUndefined(doc.id)) cb(err);
      cb(err, doc.versionOfId ? doc.versionOfId : doc.id);
    })
  };

  schema.statics.get = function (id, url, cb) {
    if (_.isUndefined(cb)) {
      this.getCollection(id, url);
    } else {
      this.getItem(id, url, cb);
    }
  };

  schema.statics.getCollection = function (url, cb) {
    this.find({}).exec(function (err, docs) {
      if (err) cb(err);
      cb(err, new Resource(url, _.isArray(docs) ? docs : [docs]));
    });
  };

  schema.statics.getItem = function (id, url, cb) {
    this.findById(id, function (err, doc) {
      if (err) cb(err);
      cb(err, new Resource(url, doc), doc);
    });
  };

  schema.statics.delete = function (id, cb) {
    this.findByIdAndRemove(id, cb);
  };

  schema.statics.put = function (id, model, cb) {
    var self = this;
    // TODO - this implementation works but is inefficient
    if (_.isFunction(this.saveVersion)) {
      var version = {
        versionId: null, // force versions
        versionOfId: id,
        data: model
      }
      this.saveVersion(version, function (err) {
        if (err) cb(err);

        self.findById(id, function (err, doc) {
          if (err) return cb(err);
          // TODO: need to invoke validators - see http://mongoosejs.com/docs/api.html#model_Model-findByIdAndUpdate
          _.each(model, function (v, k) {
            doc.set(k, v);
          });
          doc.increment();
          doc.save(cb);
        });

      })
    } else {
      self.findById(id, function (err, doc) {
        if (err) return cb(err);
        // TODO: need to invoke validators - see http://mongoosejs.com/docs/api.html#model_Model-findByIdAndUpdate
        _.each(model, function (v, k) {
          doc.set(k, v);
        });
        doc.increment();
        doc.save(cb);
      });
    }

  };

  schema.set('toJSON', { transform: function (doc, ret, options) {
    delete ret.versionId;
    delete ret._id;
    delete ret.__v;
  }});

}