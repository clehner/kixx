/**
 * @fileOverview Bootsrap Kixx BACKSTAGE object
 */

/*jslint
onevar: true,
evil: true,
undef: true,
nomen: true,
eqeqeq: true,
plusplus: true,
bitwise: true,
strict: true,
immed: true
*/

/*global
Components: false,
document: false,
window: false,
XMLHttpRequest: false
*/

"use strict";

/**
 * @namespace Kixx Backstage application namespace.
 */
var BACKSTAGE = {};

/**
 */
BACKSTAGE.moduleError = function moduleError(aFilename, aMsg, aEvalLine, aRaisedLine, aOffset) {
    var newEx = new Error(aMsg);
    newEx.fileName = aFilename || "unknown";
    newEx.lineNumber = (aEvalLine - aRaisedLine) + aOffset;
    newEx.constructor = BACKSTAGE.moduleError;
    return newEx;
};

/**
 */
BACKSTAGE.evaluate = function global_evaluate(aText, aLocation) {
  try {
    return eval(aText);
  } catch (ex) {
    // wrap in an enclosure to eliminate scope exposure to eval()
    (function () {
      var deliberate =  new Error();
      throw BACKSTAGE.moduleError(
                        (aLocation || "unknown"),
                        ex.message,
                        ex.lineNumber,
                        deliberate.lineNumber,
                        5);
    }());
  }
};

// Will be populated by ../packs/chiron/lib/chiron/modules.js
var exports = BACKSTAGE.chiron = {};

window.addEventListener("load",
function () {

  // cache object to contain all loaded processes 
  // between open windows
  var cache = (function constructModuleCache() {
      // todo: we need to detect what browser platform we are running on before
      // constructing this object.
      // Components.utils.import() only works on Firefox
      return Components.utils.import(
        "resource://kixx/kixxsys/cache.js", null).CACHE;
    }()),
  
      chiron = {urls: {}};

  BACKSTAGE.chiron.urls(null, chiron.urls, null);

  // constructor for the 'sys' or 'system' object
  function constructSys() {
    var print,
        
        platform = Components.classes["@mozilla.org/fuel/application;1"].
                   getService(Components.interfaces.fuelIApplication);
        // todo: the platform object needs to dynamically detect what platform
        // we are actually running on
        // todo: FUEL only works for Firefox
        // https://developer.mozilla.org/en/FUEL/Application#See_also
   
    print = function (msg, label) {
            label = label || "log";
            msg = ((typeof msg === "undefined") ? "undefined" : msg +"");
            platform.console.log(label +": "+ msg +"\n");
        };

    return {platform: platform, print: print};
  }

  // constructor for a module loader (require()) sandbox.
  // getModuleLoader() is called with the desired path of this module loading
  // system. The require() function is rebuilt for injection into a new module
  // each time a non-cached module is loaded.
  function getModuleLoader(ml_path) {
    // members of this module loader instance are prefixed with 'ml_'
    var ml_sandbox,
        ml_Require,
        ml_main,
        
        ml_system = constructSys(),

        // cache object to contain all loaded modules
        // between open windows
        ml_moduleCache,

        // cache object to contain all loaded factory function
        // between open windows
        ml_factoryCache,

        /**
         */
        ml_loader;
      
    ml_path = ml_path || "";
    if (typeof ml_path !== "string") {
      throw new Error("Unexpected module id passed to module loader: "+ ml_path);
    }

    ml_loader = (function constructLoader() {
          var loader_pub = {};

          /**
           * Fetches the text contents of the resource located at the given URL.
           * !Note: The '.js' suffix is appended to all passed URLs
           * @param {string} aURL The URL to fetch.
           * @returns {string} The text body of the resource.
           */
          function fetch(aURL) {
            var req = new XMLHttpRequest();

            aURL = aURL + ".js";

            // we do this because we don't want XHR to try to create a DOM
            req.overrideMimeType("text/plain");

            try {
              req.open("GET", aURL, false);
            } catch(openEx) {
              // this is better than the native error
              throw new Error("Could not load invalid uri "+ aURL);
            }

            // todo: use a timer so this does not block
            // for too long without raising an exception
            try {
              req.send(null);
            } catch(sendEx) {
              // this is better than the native error
              throw new Error("Could not find uri "+ aURL);
            }
            return req.responseText;
          }

          /**
           * Evaluates JavaScript module text by the current engine.
           * @param {string} aText The text to evaluate.
           * @param {string} [aURL] The location of the text (used for error reporting)
           * @returns {function} The factory function for a module.
           */
          function evaluate(aText, aURI) {
            // todo: the second System() parameter is there for backward
            // compatability with modules that use "system" instead of "sys"
            aURI = aURI || "unknown";
            return BACKSTAGE.evaluate(("(function (exports, require, module, sys, system) {" +
                  aText +"})"), aURI);
          }

          /**
           * This function must return a top-level module identifier given any other
           * valid CommonJS module identifier. The given identifier may be relative
           * to the base identifer or a top-level identifier itself, in which case
           * the base identifier is ignored. If the module loader supports module
           * identifiers outside the CommonJS module identifier domain, resolve must
           * return some form of canonical module identifier acceptable by
           * require(canonicalId)
           *
           * @param {string} aURL Relative or base URL.
           * @param {string} [aBaseURL] The optional base URL to resolve from.
           */
          function resolve(aURL, aBaseURL) {
            if (typeof aURL !== "string") {
                throw new Error("Module id '" + aURL + "' is not a string.");
            }
            if (!aBaseURL) {
                aBaseURL = ml_path;
            }
            if (aURL[0] !== ".") {
                aBaseURL = ml_path;
            }
            return chiron.urls.resolve(aURL, aBaseURL);
          }

          /**
           * Fetch a JavaScript module text, evaluate it, and return the resulting
           * module factory function.
           *
           * @param {string} aURI The URI of the module to load.
           */
          function load(aURI) {
            if (typeof aURI !== "string") {
              throw new Error("load() was passed unexpected non-string parameter: "+ aURI);
            }
            if (!ml_factoryCache.hasOwnProperty(aURI)) {
              ml_factoryCache[aURI] = evaluate(fetch(aURI), aURI);
            }
            return ml_factoryCache[aURI];
          }

          /**
           */
          function reload(aURI) {
            if (typeof aURI !== "string") {
              throw new Error("reload() was passed unexpected non-string parameter: "+ aURI);
            }
            ml_factoryCache[aURI] = evaluate(fetch(aURI), aURI);
            delete ml_moduleCache[aURI];
          }

          loader_pub.resolve = resolve;
          loader_pub.fetch = fetch;
          loader_pub.evaluate = evaluate;
          loader_pub.load = load;
          loader_pub.reload = reload;
          return loader_pub;
        }());

    // the sandbox routine that makes all the magic happen
    // it is passed a module id and returns the loaded module
    ml_sandbox = function moduleLoaderSandbox(aID, aBaseID) {
      // members of this sandbox routine are prefixed with 'this_'
      var this_factory,
          this_exports,
          this_require,
          this_module,
          this_id = ml_loader.resolve(aID, aBaseID),
          deliberateEx;

      if (!ml_moduleCache.hasOwnProperty(this_id)) {
        this_factory = ml_loader.load(this_id);
        this_exports = ml_moduleCache[this_id] = {};
        this_require = ml_Require(this_id);
        this_module = {id: this_id};
        try {
          this_factory(
            this_exports, // exports
            this_require, // require
            this_module, // module
            ml_system, // system as 'sys'
            ml_system); // system as 'system'
        } catch(factoryEx) {
          delete ml_moduleCache[this_id];
          deliberateEx = new Error();
          throw BACKSTAGE.moduleError(
                            aID,
                            factoryEx.message,
                            factoryEx.lineNumber,
                            deliberateEx.lineNumber,
                            218);
          // todo: the offset number (the last param to moduleError() is
          // dependent on how many lines we are from the evaluation point in
          // this file, and as such, is subject to failure if any code changes
          // are made between here and there.  Is there a way to set this
          // programmatically???
        }
      }

      return ml_moduleCache[this_id];
    };

    // construct a require() object
    ml_Require = function constructRequire(aBaseID) {
      // will become the public require() object for the new module
      function pub(aID) {
        if (typeof aID !== "string") {
          throw new Error("Unexpected module id passed to require(): "+ aID);
        }
        return ml_sandbox(aID, aBaseID);
      }

      pub.loader = ml_loader;
      pub.main = ml_main;
      return pub;
    };

    /**
     * The only public entry point to start a process with a module loader
     */
    function run(aID) {
      var pre = 0,
          processCache,
          key = new Date(),
          failed = true;
      
      if (typeof aID !== "string") {
        throw new Error("Unexpected module id passed to module loader: "+ aID);
      }

      // if this module loader has already been run,
      // raise an exception
      if (ml_main) {
        throw new Error("Module loader has already been run. "+
            "(called from "+ (run.caller.name || "anonymous") +"())");
      }

      while(failed) {
        key = key.getTime() +":"+ pre;
      
        try {
          processCache = cache(key);
          failed = false;
        } catch(e) {
          if (e !== ("Shared cache key '"+ key +"' already exists.")) {
            throw e;
          }
          pre += 1;
        }
      }

      ml_moduleCache = processCache.modules = {};
      ml_factoryCache = processCache.factories = {};

      ml_main = ml_loader.resolve(aID, ml_path);
      return ml_sandbox(aID, ml_path);
    }

    run.loader = ml_loader;

    return run;
  }

  (function init() {
    var ev;
    BACKSTAGE.getModuleLoader = getModuleLoader;
    getModuleLoader("resource://kixx/packs/")("platform/init");
    ev = document.createEvent("Event");
    ev.initEvent("moduleLoaderReady", true, false);
    window.dispatchEvent(ev);
  }());

}, false);
