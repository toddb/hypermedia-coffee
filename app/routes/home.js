module.exports = function (app) {
  return function (collections) {
    return function (req, res) {
      'use strict';
      res.render('home', {
        title: 'Coffee Order',
        link_rel: '<link rel="collection" type="application/json" href="' + res.locals.schema + collections[1] + '">',
        auth_rel: '<link rel="authenticator" type="application/json" href="' + res.locals.schema + collections[0] + '">',
        data_main: app.locals.data_main });
    };
  };

};