module.exports = function toJsonRepresentation(app) {

  var Feed = require('../representation').Feed,
      FeedItem = require('../representation').FeedItem;

  app.use(function initialise(req, res, next) {

    function checkError(err) {
      if (err) return res.status(501).send(err);
    }

    var toJsonRepresentation = function (representation, fn) {
      if (fn != undefined) {
        fn(representation)
      }
      res.type('application/json');
      res.send(representation)
    };

    /**
     *
     * @param url
     * @param fn
     */
    res.toRepresentation = function (url, fn) {
      toJsonRepresentation(new FeedItem(url, {}), fn);
    };

    res.toFeedRepresentation = function (err, doc, url, fn) {
      checkError(err);
      toJsonRepresentation(new Feed(url, doc), fn);
    };

    res.toFeedItemRepresentation = function (err, doc, url, fn) {
      checkError(err);
      res.etag(doc.id, doc.modified);

      toJsonRepresentation(new FeedItem(url, doc), fn);
    };

    res.toCreatedRepresentation = function (err, id) {
      checkError(err);
      var url = res.locals.request_url + id;
      res.set({Location: url});
      res.status(201);
      toJsonRepresentation(new FeedItem(url, {}), function (representation) {
        representation.addLink('parent', res.locals.request_url);
      });
    };

    res.toNoResponseRepresentation = function (err) {
      checkError(err);
      res.status(204);
    };

    next();
  });
};
