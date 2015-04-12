var _ = require('underscore');

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

  schema.statics.getCollection = function (cb) {
    this.find({}).exec(function (err, docs) {
      cb(err, _.isArray(docs) ? docs : [docs]);
    });
  };

  schema.statics.getItem = function (id, cb) {
    this.findById(id, function (err, doc) {
      cb(err, doc);
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

  schema.set('toJSON', {
    transform: function (doc, ret, options) {
      delete ret.versionId;
      delete ret._id;
      delete ret.__v;
    }
  });

}