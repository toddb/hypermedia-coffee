/*global angular:true*/
/**
 * @fileOverview
 * A utility class for manipulating a list of links that form a semantic interface to a resource.
 *
 * @returns {Object} A view
 *
 * Example data of a collection Resource object with a array called links:
 *
 * <code>
 * {
 *  links: [
 *    { rel: "collection" type: "application/json", href: "http://localhost/orders/" },
 *    { rel: "self" type: "application/json", href: "http://localhost/orders/" },
 *    { rel: "item", type: "application/json", href: "http://localhost/orders/1"},
 *    { rel: "first", type: "application/json", href: "http://localhost/orders/1"},
 *    { rel: "item", type: "application/json", href: "http://localhost/orders/2"},
 *    { rel: "item", type: "application/json", href: "http://localhost/orders/3"},
 *    { rel: "last", type: "application/json", href: "http://localhost/orders/3"},
 *   ]
 * }
 * </code>
 *
 * Parameters
 * ==========
 *
 * The methods of this object tend to use the following parameters:
 *
 * links
 * -----
 *
 * This is the first parameter to most methods on this object. It
 * is an object with some form of semantic interface, that contains
 * links. The supported forms of this parameter are:
 * - the `<head>` element of a html DOM
 * - the magic identifer `HEAD` (as a synonym for the <head> element)
 * - an array of link objects with `rel`, `type` and `href` values
 * - an object with a `links` object which an array of link objects
 *
 * relationshipType
 * ----------------
 *
 * This parameter is a well known (or custom) relationship type.
 * e.g `collection`, `first`, `self`, `item`
 *
 * The relation stype can be:
 * - an exact matching string
 * - a magic wildcard string `*`
 * - a regular expression
 *
 * mediaType
 * ---------
 *
 * This paramter is a well known mime type. e.g. `application/json`, `text/html` etc.
 *
 * The relation stype can be:
 * - an exact matching string
 * - a magic wildcard string `*`
 * - a regular expression
 */

define(['jquery', 'underscore', 'angular'], function ($, _, angular) {

        function httpLink($http, $q, $log) {

            /**
             * Map the list of child <link> elements from the given DOM element into simple link objects.
             *
             * @param {DOM} element
             * @param {String} relationshipType
             * @param {String} mediaType
             * @return {Array.<Link>} an array of links that match
             */
            function filterDom(element, relationshipType, mediaType) {
                var links = $(element)
                    .find('link')
                    .filter('link[href][rel]')
                    .map(function (index, link) {
                        return { href: link.href, rel: link.rel, type: link.type };
                    })
                    .get();
                return filterLinks(links, relationshipType, mediaType);
            }

            /**
             * Map the list of child <link> elements from the given JSON representation.
             *
             * @param {Object} representation
             * @param {String|Regex} relationshipType
             * @param {String} mediaType
             * @return {Array.<Link>} an array of links that match
             */
            function filterRepresentation(representation, relationshipType, mediaType) {
                if (!_.isUndefined(representation) && _.contains(_.keys(representation), 'links')) {
                    return filterLinks(representation.links, relationshipType, mediaType);
                }
                return []; // No links member on the object, so nothing matches
            }

            /**
             * A utility helper function to match a relationship type of media type string
             *
             * Match a link string if:
             *   a regular  expression is used
             *   the string is a special case wildcard string of '*'
             *   the string matches the link string
             *
             * @param {String} linkString
             * @param {String} matchString
             * @return {Boolean}
             */

            function matchParameter(linkString, matchString) {
                return (linkString &&
                    _.isRegExp(matchString) &&
                    linkString.match(matchString)) ||
                    matchString === '*' ||
                    matchString === '*/*' ||
                    linkString === '*/*' ||
                    linkString === matchString;
            }

            /**
             * Get an array of links that match the given relationship type and media type, where the link has a href
             *
             * @param {Array.<Link>|Object} links
             * @param {String|RegExp} relationshipType
             * @param {?String} mediaType
             * @return {Array.<Link>} an array of links that match
             */

            function filterLinks(links, relationshipType, mediaType) {
                if (_.isArray(links)) {
                    return _.filter(links, function (link) {
                        var linkKeys = _.keys(link);
                        if (_(linkKeys).contains('href')) {
                            if (_(linkKeys).contains('rel')) {
                                if (!matchParameter(link.rel, relationshipType)) {
                                    return false; // relationship type doesn't match
                                }
                            }
                            if (_(linkKeys).contains('type')) {
                                if (!matchParameter(link.type, mediaType)) {
                                    return false; // media type doesn't match
                                }
                            }
                            return true; // it seems to match, and it has an url.
                        }
                        return false; // no match;
                    });
                }
                $log.warn('Array input expected - filterLinks');
                return []; // No links match the filter requirements.
            }

            /**
             * Query whether the 'links' has one or more link elements that match the given criteria.
             *
             * @param {Array.<Link>|Object} links
             * @param {String} relationshipType
             * @param {String} mediaType
             * @return {Boolean} Whether there is one or more matching links
             */

            function matches(links, relationshipType, mediaType) {
                return !_.isEmpty(filter(links, relationshipType, mediaType));
            }

            /**
             * Filter the list of links based on a relationship type and media type.
             * The result is an array of links objects.
             *
             * The results are not sorted. When multiple link entries are matched
             * then the order should not be assumed.
             *
             * Given a set of links (which can be in several forms), generate a
             * list of filtered links that match the given relation type and media type
             *
             * @param {DOM|CSSSelector|Array<Link>|Resource} arg
             * @param {String} relationshipType
             * @param {String} mediaType
             * @return {Array.<Link>} an array of links that match
             */

            function filter(arg, relationshipType, mediaType) {
                mediaType = mediaType || '*/*';

                if (_.isArray(arg)) {
                    // filter an array of JSON link objects
                    return filterLinks(arg, relationshipType, mediaType);

                } else if (arg === 'HEAD') {
                    // Filter 'link' elements from the 'head' element of the DOM, this is a
                    // shortcut method so the caller doesn't have to express "$('HEAD')[0]"
                    return filterDom($('head')[0], relationshipType, mediaType);

                } else if (_.isElement(arg)) {
                    // Filter 'link' elements from the DOM
                    return filterDom(arg, relationshipType, mediaType);

                } else {
                    // Filter based on a representation with an array on 'links'
                    return filterRepresentation(arg, relationshipType, mediaType);
                }
            }

            /**
             * HTTP/xhr utilities that wrap angular $http. It particularly ensures `Accept` headers are set.
             *
             * @param {Array.<Link>|Object} links
             * @param {String} relationshipType
             * @param {String} mediaType
             * @param {GET|PUT|POST|DELETE} verb
             * @param {*} data
             * @return {HttpPromise}
             */

            function ajaxLink(links, relationshipType, mediaType, verb, data) {
                var candidateLinks = filter(links, relationshipType, mediaType);

                if (_.isEmpty(candidateLinks)) {
                    logError(links, relationshipType, mediaType);
                    return $q.reject('The resource doesn\'t support the required interface');
                }

                // TODO: should traverse the collection return $q.all()
                var link = _.first(candidateLinks);

                return $http({
                    method: verb,
                    url: link.href,
                    data: data,
                    headers: {Accept: link.type}
                });
            }

            function logError(links, relationshipType, mediaType) {
                if (_.isNull(links) || _.isUndefined(links)) {
                    $log.error("Null or invalid object provided with semantic links information");
                }
                else {
                    $log.error(makeNotFoundMessage(links, relationshipType, mediaType));
                }
            }

            function makeNotFoundMessage(links, relationshipType, mediaType) {
                var allLinks = filter(links, '*', '*');

                return 'The semantic interface \'' + relationshipType + '\' (' + mediaType + ') is not available. ' +
                    allLinks.length + ' available semantics include ' +
                    _.map(allLinks, function (link, index) {
                        if (link.type && link.type !== '*' && link.type !== '*/*') {
                            return '"' + link.rel + '" (' + link.type + ')';
                        } else {
                            return '"' + link.rel + '"';
                        }
                    })
                        .concat(', ');
            }

            //  Public interface methods
            //  ========================

            /**
             *
             * @param {Array.<Link>|Object} links
             * @param {String} relationshipType
             * @param {String} mediaType
             * @return {HttpPromise}
             */

            function ajaxGet(links, relationshipType, mediaType) {
                return ajaxLink(links, relationshipType, mediaType, 'GET', null);
            }

            /**
             *
             * @param {Array.<Link>|Object} links
             * @param {String} relationshipType
             * @param {String} mediaType
             * @param {*} data
             * @return {HttpPromise}
             */

            function ajaxPut(links, relationshipType, mediaType, data) {
                return ajaxLink(links, relationshipType, mediaType, 'PUT', data);
            }

            /**
             *
             * @param {Array.<Link>|Object} links
             * @param {String} relationshipType
             * @param {String} mediaType
             * @param {*} data
             * @return {HttpPromise}
             */

            function ajaxPost(links, relationshipType, mediaType, data) {
                return ajaxLink(links, relationshipType, mediaType, 'POST', data);
            }

            /**
             *
             * @param {Array.<Link>|Object} links
             * @param {String} relationshipType
             * @param {String} mediaType
             * @return {HttpPromise}
             */

            function ajaxDelete(links, relationshipType, mediaType) {
                return ajaxLink(links, relationshipType, mediaType, 'DELETE', null);
            }

            /**
             *
             * @param {Array.<Link>|Object} links
             * @param {String|RegExp} relationshipType
             * @param {?String=} mediaType
             * @return {String} The uri of the relationship
             */
            function getUrl(links, relationshipType, mediaType) {
                var candidateLinks = filter(links, relationshipType, mediaType);
                if (!_.isEmpty(candidateLinks)) {
                    return _.first(candidateLinks).href;
                } else {
                    logError(links, relationshipType, mediaType);
                    return '';
                }
            }

            function getTitle(links, relationshipType, mediaType) {
                var candidateLinks = filter(links, relationshipType, mediaType);
                if (!_.isEmpty(candidateLinks)) {
                    return _.first(candidateLinks).title;
                } else {
                    // logError(links, relationshipType, mediaType);
                    return '';
                }
            }

            return {

                //
                // Http verbs (get, put post, delete).
                //
                get: ajaxGet,
                put: ajaxPut,
                post: ajaxPost,
                // WARNING: `delete` is a reserved identifier in javascript. The delete
                // method can be called if it is used as an array name.
                del: ajaxDelete,
                'delete': ajaxDelete,
                _delete: ajaxDelete,

                // Get the first 'href' that matches the filter criteria.
                getUrl: getUrl,
                getTitle: getTitle,

                // Filter the list of links based on a relationship type and media type.
                // The result is an array of links objects.
                //
                // The results are not sorted. When multiple link entries are matched
                // then the order should not be assumed.
                filter: filter,

                matches: matches
            };
        }

        return angular.module('httpLink', ['ng']).
            factory('link', ['$http', '$q', '$log', httpLink]);
    }
);
