'use strict';

var Resource = require('../representation/index').json;

module.exports =  function (collections) {
    return function (req, res) {
      var representation = new Resource(res.locals.self);
      representation.addLink("orders", res.locals.schema + collections[1]);
      representation.addLink("authenticator", res.locals.schema + collections[0]);
      res.type('application/json');
      res.set({ Allow: 'GET'});
      res.send(representation);
    };
};