var _ = require('lodash'),
    url = require('url'),
    $log = {
      debug: console.log,
      warn: console.log,
      error: console.log
    };

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
        return {href: link.href, rel: link.rel, type: link.type};
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

  } else {
    // Filter based on a representation with an array on 'links'
    return filterRepresentation(arg, relationshipType, mediaType);
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
    $log.error(links, relationshipType, mediaType);
    return '';
  }
}

/**
 *
 * @param {Array.<Link>|Object} links
 * @param {String|RegExp} relationshipType
 * @param {?String=} mediaType
 * @return {String} The pathname from the uri of the relationship
 */
function getUrlPathname(links, relationshipType, mediaType){
  return url.parse(getUrl(links, relationshipType, mediaType)).pathname;
}

function getTitle(links, relationshipType, mediaType) {
  var candidateLinks = filter(links, relationshipType, mediaType);
  if (!_.isEmpty(candidateLinks)) {
    return _.first(candidateLinks).title;
  } else {
    $log.error(links, relationshipType, mediaType);
    return '';
  }
}

module.exports = exports = {

  // Get the first 'href' that matches the filter criteria.
  getUrl: getUrl,
  getUrlPathName: getUrlPathname,
  getTitle: getTitle,

  // Filter the list of links based on a relationship type and media type.
  // The result is an array of links objects.
  //
  // The results are not sorted. When multiple link entries are matched
  // then the order should not be assumed.
  filter: filter,

  matches: matches
}