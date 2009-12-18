/**
 * @fileOverview
 */

/*jslint
onevar: true,
evil: true,
undef: true,
nomen: true,
eqeqeq: true,
bitwise: true,
plusplus: true,
strict: true,
immed: true
*/

/*global
exports: true,
require: false,
module: false,
sys: false
*/

"use strict";

var SQLITE_SCHEMA =
  ("CREATE TABLE IF NOT EXISTS annotations(" +
   " namespace VARCHAR(256)," +
   " namekey VARCHAR(256)," +
   " value MEDIUMTEXT," +
   " PRIMARY KEY (namespace, namekey));");

var memcache = require("./memcache_1");

var getConnection = (function getCxn() {
    var cxn = require("services/storage_1").open("kixx_annodb");
    cxn.execute(SQLITE_SCHEMA);

    return function getConn() {
      return cxn;
    };
}());

function sanitizeValue(aValue) {
  if(typeof aValue === "string") {
    return aValue;
  }
  return JSON.stringify(aValue);
}

function desanitizeValue(aValue) {
  sys.print(aValue);
  return JSON.parse(aValue);
}

function checkParams(aKey, aNamespace) {
  if(typeof aKey !== "string" || !aKey) {
    throw ("annodb::"+ checkParams.caller.name +
        "() aKey parameter must be a string. Called by "+
        checkParams.caller.caller.name +"().");
  }
  if(typeof aNamespace !== "string" || !aNamespace) {
    throw ("annodb::"+ checkParams.caller.name +
        "() aNamespace parameter must be a string. Called by "+
        checkParams.caller.caller.name +"().");
  }
}

/**
 * Sets a key's value, regardless of previous contents in db.
 */
exports.set = function set(aKey, aValue, aNamespace) {
  checkParams(aKey, aNamespace);

  // short circuit if we alrealy have the value in memcache
  if(memcache.get(aKey, aNamespace) === aValue) {
    return true;
  }

  aValue = sanitizeValue(aValue);

  getConnection().execute("INSERT OR REPLACE INTO annotations VALUES (:ns, :k, :v)",
      {ns: aNamespace, k: aKey, v: sanitizeValue(aValue)});
  memcache.set(aKey, aNamespace, aValue);
  return true;
};

/**
 * Looks up a single key in annodb.
 */
exports.get = function get(aKey, aNamespace) {
  var rv;
  checkParams(aKey, aNamespace);

  rv = memcache.get(aKey, aNamespace);
  if(rv) {
    return rv;
  }

  rv = getConnection().executeStep("SELECT value FROM annotations WHERE "+
      "namespace=:ns AND namekey=:k",
      {ns: aNamespace, k:aKey});

  if (rv.hasMore()) {
    rv = desanitizeValue(rv.next().value);
  } else {
    rv = null;
  }
  memcache.set(aKey, aNamespace, rv);
  return rv;
};

exports.remove = function remove(aKey, aNamespace) {
  checkParams(aKey, aNamespace);

  getConnection().executeStep("DELETE FROM annotations WHERE "+
      "namespace=:ns AND namekey=:k",
      {ns: aNamespace, k:aKey});
  memcache.del(aKey, aNamespace);
};
