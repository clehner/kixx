// annotation memory

var SQLITE_SCHEMA =
  ("CREATE TABLE annotations(" +
   "  namespace VARCHAR(256)," +
   "  namekey VARCHAR(256)," +
   "  value MEDIUMTEXT," +
   " PRIMARY KEY (namespace, namekey));");

var memcache = require("./memcache_1");

/**
 * Sets a key's value, regardless of previous contents in db.
 */
// todo: annodb.set() should return some indication of success or failure,
// or even a reference pointer to the call.  What does chromium do?
exports.set = function set(aKey, aValue, aNamespace, aCallback)
{
  // todo: use debug module to handle errors
  if(typeof aKey != "string" || !aKey) {
    throw new Error("annodb.set() key parameter must be a string.");
  }
  if(typeof aNamespace != "string" || !aNamespace) {
    throw new Error("annodb.set() namespace parameter must be a string.");
  }
  if(typeof aCallback != "function") {
    throw new Error("annodb.set() callback parameter must be a function.");
  }

  aValue = sanitizeValue(aValue);

  if(memcache.get(aKey, aNamespace) == aValue) {
    aCallback(true);
    return;
  }

  var db = getConnection();
  var sql = ("INSERT OR REPLACE INTO annotations "+
      "VALUES (:namespace, :key, :value)");
  var s = null;
  try
  {
    s = db.createStatement(sql);
    s.params.namespace = aNamespace;
    s.params.key = aKey;
    s.params.value = aValue;
    s.executeAsync({
      handleCompletion:function(reason) {
        if(reason !=
          Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
        {
          // todo: use debug module to handle this case with assert
          Components.utils.reportError(
            "annodb.set(): unexpected SQLite result");
          aCallback(false);
        }
        memcache.set(aKey, aValue, 0, aNamespace);
        aCallback(true);
      },
      handleError:function(err) {
        // todo: use debug module to handle this case with assert
        Components.utils.reportError(
          "annodb.set(): SQLite error: "+ err.message);
        aCallback(false);
      }
    });
  }
  catch(e if e.result == Components.results.NS_ERROR_FAILURE)
  {
    var sqlerr = db.lastErrorString;
    s.finalize();
    db.close();
    throw new Error("annodb.set(): "+ e +"; SQL error: "+
         sqlerr +" in "+ sql);
  }
  s.finalize();
  db.close();
}

/**
 * Looks up a single key in annodb.
 */
// todo: annodb.get() should return some indication of success or failure,
// or even a reference pointer to the call.  What does chromium do?
exports.get = function get(aKey, aNamespace, aCallback)
{
  // todo: use debug module to handle errors
  if(typeof aKey != "string" || !aKey) {
    throw new Error("annodb.get() key parameter must be a string.");
  }
  if(typeof aNamespace != "string" || !aNamespace) {
    throw new Error("annodb.get() namespace parameter must be a string.");
  }
  if(typeof aCallback != "function") {
    throw new Error("annodb.get() callback parameter must be a function.");
  }

  var rv = memcache.get(aKey, aNamespace);
  if(rv != null) {
    aCallback(true, desanitizeValue(rv));
    return;
  }

  var db = getConnection();
  var sql = ("SELECT value FROM annotations WHERE "+
      "namespace=:ns AND namekey=:key");
  var s = null;
  try
  {
    s = db.createStatement(sql);
    s.params.ns = aNamespace;
    s.params.key = aKey;
    s.executeAsync({
      handleResult: function(results) {
        for(var row = results.getNextRow(); row; row = results.getNextRow())
        {
          rv = desanitizeValue(row.getResultByName("value"));
          break; // we only care about 1 result
        }
      },
      handleCompletion:function(reason) {
        if(reason !=
          Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
        {
          // todo: use debug module to handle this case with assert
          var msg = "annodb.get(): unexpected SQLite result";
          Components.utils.reportError(msg);
          aCallback(false, new Error(msg));
          return true;
        }
        memcache.set(aKey, rv, 0, aNamespace);
        aCallback(true, rv);
      },
      handleError:function(err) {
        // todo: use debug module to handle this case with assert
        var msg = "annodb.get(): SQLite error: "+ err.message;
        Components.utils.reportError(msg);
        aCallback(false, new Error(msg));
      }
    });
  }
  catch(e if e.result == Components.results.NS_ERROR_FAILURE)
  {
    var sqlerr = db.lastErrorString;
    s.finalize();
    db.close();
    throw new Error("annodb.get(): "+ e +"; SQL error: "+
         sqlerr +" in "+ sql);
  }
  s.finalize();
  db.close();
}

function getConnection()
{
  var f = require("services/os_1").file.open("Profile");
  f.append("kixx_annodb.sqlite");
  var ss = Components.classes["@mozilla.org/storage/service;1"]
    .getService(Components.interfaces.mozIStorageService);
  var db = ss.openDatabase(f);

  if(!db.tableExists("annotations"))
    db.executeSimpleSQL(SQLITE_SCHEMA);

  return db;
  // todo: how do we remove this db on uninstall???
}

function sanitizeValue(aValue) {
  if(typeof aValue == "string") return aValue;
  return JSON.stringify(aValue);
}

function desanitizeValue(aValue) {
  return JSON.parse(aValue);
}
