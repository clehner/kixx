var BackstagePass = this;

// todo: use XMLHttpRequest and eval to be compatible with chromium
function load(file, context)
{
  let sl = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader);

  let ios = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);

  // get a url for the file
  let uri = ios.newFileURI(file);

  sl.loadSubScript(uri.spec, context);
  return context;
}

function require(id, version)
{
  if(typeof id != "string" || !id) {
    throw new Error("require() id parameter must be a string.");
  }

  if(typeof version != "string" && typeof version != "number") {
    version = "";
  }

  // Import the cache.
  // Mozilla prevents reloading an import internally, so this is a one time
  // operation that will last for the whole session, nomatter how many times it
  // gets called.
  let memcache = Components.utils.import(
    "resource://kixx/memcache/__init__0.1.js", null);
  let ns = "KIXX_IMPORT_CACHE";

  // check the cache for the module id and, if it exists,
  // return the requested object
  let rv = memcache.get(id + version, ns);
  if(rv) return rv;

  // check all root directories for a match to the first part,
  // If not found; fail
  // todo: this could be done by the os module
  let em = Components.classes["@mozilla.org/extensions/manager;1"].
           getService(Components.interfaces.nsIExtensionManager);

  let mod = em.getInstallLocation("kixx@fireworksproject.com")
    .getItemLocation("kixx@fireworksproject.com");
  mod.append(id);

  if(!mod.exists() || !mod.isDirectory())
    throw new Error("require(): Could not find module '"+ id +"'.");

  // check the found dir for an __init__ file with
  // the specified version number. If not found; fail.
  mod.append("__init__"+ version +".js");
  if(!mod.exists() || !mod.isFile()) {
    throw new Error("require(): Could not find __init__"+ version
        +".js for module '"+ id +"'.");
  }

  let imp = {};
  imp.require = arguments.callee;

  // load the module and stash it in the cache
  memcache.set(id, load(mod, imp), 0, ns);

  return imp;
}

function loadWithRequire(file, context)
{
  if(typeof(context.require) != "function")
    context.require = require;
  return load(file, context);
}

function execute(script, context)
{
  if(typeof context != "object" || typeof context.eval != "function")
    throw new Error("imputil.execute(): invalid context object");

  if(typeof(context.require) != "function")
    context.require = require;

  return context.eval(script);
}

function getBackstagePass()
{
  return Components.utils.import(
      "resource://kixx/imputil/BackstagePass.js", null);
}
