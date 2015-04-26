exports = module.exports = function (app) {
  app.use(function (req, res, next) {
    res.redirect = function (url) {
      res.status(200).send(url);
    };
    next();
  });
}