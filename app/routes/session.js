var Resource = require('../representation').json;

exports.collection = function (req, res) {
  var resource = new Resource(res.locals.self);
  if (req.isAuthenticated()) {
    resource.collectionLinks(res.locals.self, [
      { _id: req.sessionID}
    ]);
    resource.addLink('create-form', 'text/html', res.locals.self + 'post.html');
  }
  res.send(resource);
};

exports.item = function (collection) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.sessionID != req.params.sid) {
      console.log("Pontential session hijacking", req.sessionID, req.params.sid);
    }
    var doc = new Resource(res.locals.self, { username: req.user.username});
    doc.addLink('collection', res.locals.schema + collection);
    doc.addLink('delete-form', 'text/html', res.locals.schema + collection + 'delete.html');
    res.type('application/json');
    res.send(doc);
  };
};