define(function () {
    'use strict';

    /**
     * This is trivial proof-of-concept implementation of client
     * side URI mapping.
     *
     * It is known NOT to work if the api URI is not prefixed
     * with the base api uri (which will happen if the api supports
     * distributed serving of content from multiple uris.
     */
    function UriMapping(clientUri, apiUri) {
        var self = this;

        /**
         * Remove the scheme and the authority and just return the path.
         *
         * @param {string} anApiUri a URI in the api namespace
         * @param {string} sitePrefix the client side routing part of the URL
         */
        self.toSitePath = function (anApiUri, sitePrefix) {
            var apiPathSuffix = anApiUri.replace(apiUri, '');
            if (apiPathSuffix) {
                var sitePrefixWithoutTrailingSlash = sitePrefix.replace(/\/$/, '');
                if (/^\//.test(apiPathSuffix)) {
                    return sitePrefixWithoutTrailingSlash + apiPathSuffix;
                } else {
                    return sitePrefixWithoutTrailingSlash + '/' + apiPathSuffix;
                }
            } else {
                return sitePrefix;
            }
        };

        self.makeRelative = function (anApiUri) {
            var apiPathSuffix = anApiUri.replace(apiUri, '');
            if (apiPathSuffix) {
                if (/^\//.test(apiPathSuffix)) {
                    return apiPathSuffix.substring(1);
                } else {
                    return apiPathSuffix;
                }
            } else {
                return '';
            }
        };

        /**
         *
         * @param path
         * @param sitePrefix the client side routing part of the URL
         * @returns {string} an API URI
         */
        self.fromSitePath = function (path, sitePrefix) {
            if (/\/$/.test(apiUri)) {
                if (/\/$/.test(sitePrefix)) {
                    return apiUri + path.replace(sitePrefix, '');
                } else {
                    return apiUri + path.replace(sitePrefix + '/', '');
                }
            } else {
                return self.makeAbsolute(path.replace(sitePrefix, ''));
            }
        };

        self.makeAbsolute = function (path) {
            var pathWithLeadingSlash = path.replace(/^\//, '');
            if (/\/$/.test(apiUri)) {
                return apiUri + pathWithLeadingSlash;
            } else {
                return apiUri + '/' + pathWithLeadingSlash;
            }
        };
    }

    return UriMapping;
});
