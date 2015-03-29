define(['angular', 'util/uriMapping', './providersModule'], function (angular, UriMapping, providers) {
  'use strict';

  return providers
      .provider('UriMapper', function () {
        var self = this;
        var mapping;

        /**
         *
         * @param {string} clientUri
         * @param {string} apiUri
         */
        self.initialise = function (clientUri, apiUri) {
          mapping = new UriMapping(clientUri, apiUri);
          return self;
        };

        self.$get = function () {
          if (!mapping) {
            throw new Error("UriMapper has not been initialised. app.js must call UriMapperProvider.initialise");
          }
          return mapping;
        };
      });
});
