define(['services/module', 'underscore'], function (module, _) {
  'use strict';


  function Resource($http, $q, $log, link) {

    function error(response) {
      return $q.reject(response);
    }

    function addByRel(rel) {
      return function success(response) {
        var obj = {};
        obj[rel] = response.data;
        return obj
      }
    }

    function reduce(resourceResponse) {
      return function success(resource) {
        return  _.reduce(resource, function (memo, item) {
          return _.extend(memo, item)
        }, resourceResponse.data);
      }
    }

    function extendCollectionByRel(collectionResponse, rel) {
      return function success(resource) {
        collectionResponse.data[rel] = resource;
        return collectionResponse;
      };
    }

    // TODO: think about this properly - it should always return array
    function successAllOrFirst(response) {
      return response.length == 1 ? _.first(response) : response;
    }

    return {
      filter: link.filter,
      matches: link.matches,
      getUrl: link.getUrl,
      put: function (links, relationshipType, mediaType, data) {
          // TODO: relationshipType & mediaType could be normalised if needed (self, application/json)
        return link.put(links, relationshipType, mediaType, data);
      },
      post: function (links, relationshipType, mediaType, data) {
          // TODO: relationshipType & mediaType could be normalised if needed (self, application/json)
          return link.post(links, relationshipType, mediaType, data).then(
          function success(response) {
            if (!response.headers('Location')) {
              return $q.reject('No Location was provided from resource');
            }
            return $http.get(response.headers('Location'), {headers: {Accept: mediaType}})
          }, error);
      },
      del: function (links, relationshipType, mediaType) {
          // TODO: relationshipType  could be normalised if needed (self)
        return link.del(links, relationshipType || 'self', mediaType || '*');
      },
      get: function (links, relationshipType, mediaType) {

        // rel is string to get on url
        if (_.isString(relationshipType)) {
          return link.get(links, relationshipType, mediaType);
        }

        // TODO: this is currently not recursive and is unreadable
        return $q.all(_.map(relationshipType, function (item, rel) {
            return link.get(links, rel, mediaType).
              then(function success(response) {

                // rel is only 1 deep and not a collection { item: 'viewstate' }
                if (_.isString(item) && !_.isEmpty(item)) {
                  return link.get(response.data, item, mediaType);
                }

                // rel is 2 deep  { collection : [{ item : { viewstate: {} }] }
                // iterate through all the 'item' rel because it is a collection/array
                return $q.all(_.map(item, function (item /*, rel*/) {
                  return $q.all(_.map(item, function (item, rel) {

                    // for each within the collection/array --> 'item'
                    return $q.all(_.map(link.filter(response.data, rel, mediaType), function (rel) {
                      return $http.get(rel.href, {headers: {accept: rel.type}}).
                        then(function success(response) {

                          // 'item' could also have multiple rel item: { viewstate:{}, headers:{}}
                          // now three deep -> 'viewstate'
                          return $q.all(_.map(item, function (item, rel) {
                              return link.get(response.data, rel, mediaType).
                                then(addByRel(rel), error);
                            })).
                            then(reduce(response), error)
                        }, error);
                    })).then(extendCollectionByRel(response, rel), error)
                  })).then(successAllOrFirst, error);
                })).then(successAllOrFirst, error);
              }, error);
          })).
          then(successAllOrFirst, error);
      }
    }
  }

  return module.factory('Resource', ['$http', '$q', '$log', 'link', Resource]);

});
