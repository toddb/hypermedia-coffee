'use strict';

var mongoose = require('mongoose')
    , bcrypt = require('bcrypt')
    , SALT_WORK_FACTOR = 10
    , schema = new mongoose.Schema();

schema.plugin(require('./resourcePlugin'));

schema.add({
  username: {type: String, required: true, unique: true},
  email: {type: String, unique: true},
  password: {type: String},
  accessToken: {type: String} // Used for Remember Me
});

schema.pre('save', function (next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

schema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// Remember Me (token) implementation helper method
schema.methods.generateRandomToken = function () {
  var user = this,
      chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      token = new Date().getTime() + '_';
  for (var x = 0; x < 16; x++) {
    var i = Math.floor(Math.random() * 62);
    token += chars.charAt(i);
  }
  return token;
};

module.exports = schema;
