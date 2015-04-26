/**
 * Creates a Feed representation of the logged in user account
 *
 * @param {String} parent - root path of the url
 * @param account
 * @param register
 * @returns {Function} - middleware (req, res)
 */
exports.collection = function (parent, account, register) {
  return function (req, res) {
    var url = res.locals.self;
    res.toFeedRepresentation(null, {}, url, function (representation) {
      representation.addLink('up', res.locals.schema + parent);
      representation.addLink('register', res.locals.self + register);
      representation.addLink('linkedin', 'http://example.com/not-real');
      representation.addLink('google', 'http://example.com/not-real');
      if (req.isAuthenticated()) {
        representation.addCollection(res.locals.schema + account, [{_id: req.user.id}]);
      }
    });
  }
};

/**
 * Creates a FeedItem representation of the logged in user account
 * @param collection
 * @returns {Function} - middelware (req, res)
 */
exports.item = function (collection) {
  return function (req, res) {
    if (req.isAuthenticated() && req.sessionID != req.params.sid) {
      console.log("Pontential session hijacking", req.sessionID, req.params.sid);
    }
    res.toFeedItemRepresentation(null, {username: req.user.username}, res.locals.self, function (representation) {
      representation.addLink('up', res.locals.schema + collection);
    });
  };
};

/**
 * Applies the `local` authentication strategy returning the parent representation (Api) but with logged in
 * user in the Location header
 *
 * @param collection
 * @param parent
 * @returns {Function}
 */
exports.logIn = function (collection, parent) {
  return function (req, res, next) {
    var passport = req._passport.instance;

    req.logout();

    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err)
      }
      if (!user) {
        res.status(401);
        return parent(req, res, info);
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        res.set({Location: res.locals.schema + collection + user._id});
        res.status(201);
        return parent(req, res, {username: req.user.username});
      });
    })(req, res, next);
  }
};

/**
 * Uses the authentication strategy to logout the user
 * @param {Function} parent
 * @returns {Function}
 */
exports.logOut = function (parent) {
  return function (req, res) {
    req.logout();
    res.status(204);
    return parent(req, res, {message: 'Logged out'});
  };
};

/**
 * Basic rememberMe middleware for cookie expiry
 *
 * TODO: do this properly, tb - Apr 2015
 * @param req
 * @param res
 * @param next
 */
exports.rememberMe = function (req, res, next) {
  if (req.body.rememberme) {
    req.session.cookie.maxAge = 9000; //2592000000 30*24*60*60*1000 Remember 'me' for 30 days
  } else {
    req.session.cookie.expires = false;
  }
  next();
};