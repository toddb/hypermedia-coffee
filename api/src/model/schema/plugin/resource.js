var _ = require('underscore'),
    log = require('../../../config/logger');

module.exports = exports = function resourcePlugin(schema, options) {

  schema.statics.post = function (model, cb) {

    this._save = this.saveVersion ? this.saveVersion : this.create;
    model = this.saveVersion ? {data: model} : model;


    this._save(model, function (err, doc) {

      if (err || _.isUndefined(doc) || _.isUndefined(doc.id)) {
        return cb(err);
      }
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
    this.findById(id, function(err, doc){
      if (err){
        cb(err);
      }

      doc.remove(cb);
    });
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

        // iterate using the .toObject() to gather up all values
        // TODO: this implementation needs to allow for guards ( eg created, owner)
        _.each(model.toObject(), function (v, k) {
          doc.set(k, v);
        });
        doc.increment();
        doc.save(cb);
      });
    }

  };

  /**
   * TODO: deal with existing and Array.<item>
   * @param id
   * @param updatedDoc
   * @param cb
   */
  schema.statics.putItem = function (id, updatedDoc, cb) {
    var self = this;
    self.getItem(id, function (err, doc) {
      self.put(id, doc, cb);
    })
  };

  /**
   * Creates an empty resource without metadata for a create-form.
   *
   * It builds it up from the schema and then removes backlisted fields
   *
   * TODO: do this well
   *
   * @param {Array.string} fields - fields to additionally blacklist
   * @returns {Object|Resource}
   */
  schema.statics.empty = function (fields) {
    var ret = {};
    for (path in this.schema.paths) {
      ret[path] = "";
    }
    for (field in fields) {
      delete ret[field];
    }
    delete ret.versionId;
    delete ret._id;
    delete ret.__v;
    delete ret.modified;
    delete ret.created;
    return ret;
  };

  schema.set('toJSON', {
    transform: function (doc, ret, options) {
      delete ret.versionId;
      delete ret._id;
      delete ret.__v;
    }
  });

}