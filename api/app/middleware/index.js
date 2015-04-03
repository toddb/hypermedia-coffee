module = module.exports = function (app) {
  require('./corsMiddleware')(app),
      require('./requestedUrlMiddleware')(app),
      require('./etagMiddleware')(app),
      require('./mapMiddleware')(app);

};
