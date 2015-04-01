exports = module.exports = function (app, passport) {


  var User = require('../resource').Account,
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
//
//   Both serializer and deserializer edited for Remember Me functionality
  passport.serializeUser(function (user, done) {
    var createAccessToken = function () {
      var token = user.generateRandomToken();
      User.findOne({accessToken: token}, function (err, existingUser) {
        if (err) {
          return done(err);
        }
        if (existingUser) {
          createAccessToken(); // Run the function again - the token has to be unique!
        } else {
          user.set('accessToken', token);
          user.save(function (err) {
            if (err) return done(err);
            return done(null, user.get('accessToken'));
          })
        }
      });
    };

    if (user._id) {
      createAccessToken();
    }
  });

  passport.deserializeUser(function (token, done) {
    User.findOne({accessToken: token}, function (err, user) {
      done(err, user);
    });
  });

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
  passport.use(new LocalStrategy(function (username, password, done) {
    User.findOne({username: username}, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'Unknown user ' + username});
      }
      user.comparePassword(password, function (err, isMatch) {
        if (err) return done(err);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      });
    });
  }));


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.sendStatus(401);
  };




};

//module.exports.passport = initialize();
//module.exports.login = logIn;
//module.exports.logout = logOut;
//module.exports.rememberMe = rememberMe;
//
//// TODO: inject setting for toggling authentication on/off
//module.exports.ensureAuthenticated = function (requiresAuthentication) {
//  if (!requiresAuthentication) {
//    return function (req, res, next) {
//      return next()
//    }
//  } else {
//    return ensureAuthenticated
//  }
//}(true);