var CACHE = (function createSharedCache() {
      var this_cache = {};

      function cache(aKey) {
        if (this_cache.hasOwnProperty(aKey)) {
          throw ("Shared cache key '"+ aKey +"' already exists.");
        }
        this_cache[aKey] = {};
        return this_cache[aKey];
      }
      return cache;
    }());
