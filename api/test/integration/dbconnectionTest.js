/*jslint node: true */
'use strict';

var mongoose = require('mongoose')
    , should = require('should');

//var env = "test_" + Math.floor(Math.random() * 61439 + 4096);
var env_db = "test";

module.exports = {

  before: function (done) {
    console.log("Setting up db connection")
    function clearDB() {
      for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function (err) {
        });
      }
      return done();
    }

    function reconnect() {
      mongoose.connect('localhost', env_db, function (err) {
        if (err) {
          throw err;
        }
        return clearDB();
      });
    }

    function checkState() {
      switch (mongoose.connection.readyState) {
        case 0:
          reconnect();
          break;
        case 1:
          clearDB();
          break;
        default:
          process.nextTick(checkState);
      }
    }

    checkState();
  },
  after: function (done) {
    console.log("Dropping %s database", env_db);
    mongoose.connection.db.dropDatabase();
    mongoose.disconnect();
    done();
  },

  'db connection': function () {
    var db = mongoose.connection;
    console.log("Using mongodb://%s:%s/%s", db.host, db.port, db.name);
    db.name.should.equal(env_db);
    db.host.should.equal('localhost');
  }
};
