var CACHE = (function createSharedCache() {
      var this_cache = {},
          pub = {};

      pub.create = function create(aKey) {
        if (this_cache.hasOwnProperty(aKey)) {
          throw ("Shared cache key '"+ aKey +"' already exists.");
        }
        this_cache[aKey] = {};
        return this_cache[aKey];
      }

      pub.destroy = function destroy(aKey) {
        delete this_cache[aKey];
      }

      return pub;
    }());
