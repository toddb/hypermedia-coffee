define(['services/httpLink'], function (module) {

    'use strict';

    function fragment($location, link) {

      function setFragment(links, rel, redirectWhenEmpty) {
        if ((redirectWhenEmpty || false) && "" != $location.hash()) {
          return
        }
        $location.hash(getFragment(links, rel))
      }

      function getFragment(links, rel) {
        var url = link.getUrl(links, rel);
        var prefix = $location.protocol() + '://' + $location.host();
        if (!($location.port() == 443 || $location.port() == 80)) {
          prefix += ':' + $location.port()
        }
        if (url && url.indexOf(prefix) === 0) {
          return url.substring(prefix.length);
        }
        return url;
      }

      return {
        get: getFragment,
        set: setFragment
      }
    }

    return module.factory('fragment', ['$location', 'link', fragment]);

  }
);
