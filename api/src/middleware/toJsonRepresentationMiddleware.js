module.exports = function toJsonRepresentation(app) {

  var Feed = require('../representation').Feed,
      FeedItem = require('../representation').FeedItem;

  app.use(function initialise(req, res, next) {

    function checkError(err) {
      if (err) {
        return res.status(501).send(err)
      }
    }

    function checkEmpty(doc) {
      if (!doc) {
        return res.status(404).send()
      }
    }


    /**
     * @callback Predicate
     * @param {(Feed|FeedItem)} representation
     */

    /**
     * Sends resource across the wire as a json representation
     * @param representation
     * @param {Predicate} fn predicate on a representation
     */
    var toJsonRepresentation = function (representation, fn) {
      if (fn != undefined) {
        fn(representation)
      }
      res.type('application/json');
      res.send(representation)
    };

    /**
     * Sends resource across the wire as a FeedItem json representation
     * @param url
     * @param {Predicate} fn predicate on a representation
     */
    res.toRepresentation = function (url, fn) {
      toJsonRepresentation(new FeedItem(url, {}), fn);
    };

    /**
     *  @example
     *
     * function(doc){
     *    return {
     *      id: url + doc._id,
     *   title: doc.type
     *    };
     * }
     *
     * @callback LinkPredicate
     * @param {object} doc
     */

    /**
     * Sends Feed resource across the wire as a FeedItem json representation
     * @param {Error} err
     * @param {object} doc resource to be returned
     * @param {string} url to identify the representation self link relation
     * @param {Predicate?} fn predicate on a representation
     * @param {LinkPredicate?} itemLink predicate that must return an object with {id:string, title:string}
     */
    res.toFeedRepresentation = function (err, doc, url, fn, itemLink) {
      checkError(err);
      checkEmpty(doc);
      toJsonRepresentation(new Feed(url, doc, itemLink), fn);
    };

    /**
     * Sends FeedItem resource across the wire as a FeedItem json representation
     * @param {Error} err
     * @param {object} doc resource to be returned
     * @param {string} url to identify the representation self link relation
     * @param {Predicate} fn predicate on a representation
     */
    res.toFeedItemRepresentation = function (err, doc, url, fn) {
      checkError(err);
      checkEmpty(doc);
      if (doc){
        res.etag(doc.id, doc.modified);
        toJsonRepresentation(new FeedItem(url, doc), fn);
      }
    };

    /**
     * Sends resource across the wire as a FeedItem json representation with a 201 status and Location header
     * @param {Error} err
     * @param {string} id
     */
    res.toCreatedRepresentation = function (err, id) {
      checkError(err);
      var url = res.locals.request_url + id;
      res.set({Location: url});
      res.status(201);
      toJsonRepresentation(new FeedItem(url, {}), function (representation) {
        representation.addLink('parent', res.locals.request_url);
      });
    };

    /**
     * Sends resource across the wire as a FeedItem json representation with a 204
     * @param {Error} err
     */
    res.toNoResponseRepresentation = function (err) {
      checkError(err);
      res.status(204).send();
    };

    next();
  });
};
