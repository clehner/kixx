//
// todo: use 'debug' module for errors
//

// todo: this functionality should be moved into a firefox specific module.
// the memcache module should remain platform agnostic
var shell = Components.classes["@mozilla.org/appshell/appShellService;1"]
          .getService(Components.interfaces.nsIAppShellService);
var parentElement = shell.hiddenDOMWindow.document.documentElement;
var iframe = parentElement.ownerDocument.getElementById("backstage");
var backstage = iframe.contentWindow;
var TABLE = {};

/**
 * Sets a key's value, regardless of previous contents in cache.
 */
exports.set = function set(key, value, time, namespace)
{
  if(typeof key != "string" || !key) {
    throw new Error("memecache.set() key parameter must be a string.");
  }

  namespace = sanitizeNamespace(namespace);
  TABLE[namespace] = TABLE[namespace] || {};
  TABLE[namespace][key] = value;

  return true;
}

/**
 * Looks up a single key in memcache.
 */
exports.get = function get(key, namespace)
{
  if(typeof key != "string" || !key) {
    throw new Error("memecache.get() key parameter must be a string.");
  }

  namespace = sanitizeNamespace(namespace);
  var rv = TABLE[namespace];
  if(!rv)
    return null;

  return (typeof(rv[key]) == "undefined") ? null : rv[key];
}

/**
 * Deletes a key from memcache.
 */
exports.del = function del(key, namespace)
{
  if(typeof key != "string" || !key) {
    throw new Error("memecache.del() key parameter must be a string.");
  }

  namespace = sanitizeNamespace(namespace);
  var rv = TABLE[namespace];
  if(!rv)
    return;

  delete rv[key];
}

/**
 * Sets a key's value, if and only if the item is not already in memcache.
 *
 * @returns {bool} true on success or false on failure.
 */
exports.add = function add(key, value, time, namespace)
{
  if(typeof key != "string" || !key) {
    throw new Error("memecache.add() key parameter must be a string.");
  }

  namespace = sanitizeNamespace(namespace);
  TABLE[namespace] = TABLE[namespace] || {};
  if(TABLE[namespace][key])
    return false;

  TABLE[namespace][key] = value;
  return true;
}

/**
 * Replaces a key's value, failing if item isn't already in memcache.
 *
 * @returns {bool} true on success or false on failure.
 */
exports.replace = function replace(key, value, time, namespace)
{
  if(typeof key != "string" || !key) {
    throw new Error("memecache.replace() key parameter must be a string.");
  }

  namespace = sanitizeNamespace(namespace);
  if(!TABLE[namespace] || !TABLE[namespace][key])
    return false;

  TABLE[namespace][key] = value;
  return true;
}

function sanitizeNamespace(ns)
{
  ns = (ns == null) ? "" : ns.toString();
  return ns || "_";
}
