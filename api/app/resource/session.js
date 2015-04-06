var Resource = require('../representation/index').json;

exports.collection = function (parent) {
  return function (req, res) {
    var resource = new Resource(res.locals.self);
    resource.addLink('up', res.locals.schema + parent);
    resource.addCollection(res.locals.self, [
      {_id: req.sessionID}
    ]);
    res.send(resource);
  }
};

exports.item = function (collection) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.sessionID != req.params.sid) {
      console.log("Pontential session hijacking", req.sessionID, req.params.sid);
    }
    var doc = new Resource(res.locals.self, {username: req.user.username});
    doc.addLink('up', res.locals.schema + collection);
    res.type('application/json');
    res.send(doc);
  };
};

exports.logIn = function (req, res, next) {
  var passport = req._passport.instance;

  req.logout();

  passport.authenticate('local', function (err, user, info) {
    if (err) {
      console.log("Error in login");
      return next(err)
    }
    if (!user) {
      res.status(401);
      return require('./api')(req, res, info);
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.set({Location: res.locals.request_url + user._id});
      res.status(201);
      return require('./api')(req, res, {username: req.user.username});
    });
  })(req, res, next);
}

exports.logOut = function (req, res) {
  req.logout();
  res.status(204);
  return require('./api')(req, res, {message: 'Logged out'});
}

exports.rememberMe = function (req, res, next) {
  if (req.body.rememberme) {
    req.session.cookie.maxAge = 9000; //2592000000 30*24*60*60*1000 Remember 'me' for 30 days
  } else {
    req.session.cookie.expires = false;
  }
  next();
};