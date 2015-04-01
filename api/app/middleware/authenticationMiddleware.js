exports = module.exports = function (app) {

  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.sendStatus(401);
  };

  app.all('/api/*', isAuthenticated);

}
