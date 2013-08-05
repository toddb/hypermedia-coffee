'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , resourceSchema = require('./resourcePlugin')
  , Resource = require('../representation').json;


var schema = new Schema({
  view: ObjectId,
  viewing: { type: Boolean, required: true, default: true},
  updating: { type: Boolean, required: true, default: false},
  updateable: { type: Boolean, required: true, default: true},
  removeable: { type: Boolean, required: true, default: true}
});

schema.plugin(resourceSchema);

schema.statics.getByViewId = function (id, url, cb) {
  this.findOne({view: id}, function (err, doc) {
    if (err) cb(err);
    cb(err, new Resource(url + doc.id, doc), doc);
  });
};

module.exports = schema;
