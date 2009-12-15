/**
 * @fileOverview Bootstrap Kixx BACKSTAGE object
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
 * @constructor Creates an error object with adusted line numbers.
 * This type of error is used when an error is raised while evaluating or
 * invoking a module factory function.
 */
BACKSTAGE.moduleError =
function moduleError(aFilename, aMsg, aEvalLine, aRaisedLine, aOffset) {
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

/**
 */
BACKSTAGE.platform = (function constructPlatform() {
      return Components.classes["@mozilla.org/fuel/application;1"].
                 getService(Components.interfaces.fuelIApplication);
      // todo: the platform object needs to dynamically detect what platform
      // we are actually running on
      // todo: FUEL only works for Firefox
      // https://developer.mozilla.org/en/FUEL/Application#See_also
    }());

// Will be populated by ../packs/chiron/lib/chiron/modules.js
var exports = BACKSTAGE.chiron = {};

window.addEventListener("load",
function onBackstageWindowLoad() {
  var processes = {}, moduleCache;

  BACKSTAGE.platform.console.log("Starting Kixx BACKSTAGE");

  /**
   * Fetches the text contents of the resource located at the given URL.
   * !Note: The '.js' suffix is appended to all passed URLs
   * @param {string} aURL The URL to fetch.
   * @returns {string} The text body of the resource.
   */
  function fetch(aURL) {
    var req = new XMLHttpRequest(), info;

    aURL = aURL + ".js";

    // we do this because we don't want XHR to try to create a DOM
    req.overrideMimeType("text/plain");

    try {
      req.open("GET", aURL, false);
    } catch(openEx) {
      // this is better than the native error
      throw new Error(
          "Module loader.fetch() could not load invalid uri "+ aURL);
    }

    // todo: use a timer so this does not block
    // for too long without raising an exception
    try {
      req.send(null);
    } catch(sendEx) {
      // this is better than the native error
      info = (fetch.caller.caller.caller ?
          fetch.caller.caller.caller.caller.name :
          fetch.caller.caller.name);
      throw new Error(
          "Module loader.fetch() could not find uri "+ aURL +
          ". Called by "+ info +"().");
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
    aURI = aURI || "unknown";
    return BACKSTAGE.evaluate(
        ("(function (exports, require, module, sys, system) {" + aText +"})"),
        aURI);
    // The second system parameter is there for backward compatability with
    // modules that use "system" instead of "sys"
  }

  /**
   * Fetch a JavaScript module text, evaluate it, and return the resulting
   * module factory function.
   *
   * @param {string} aURI The URI of the module to load.
   */
  function load(aURI) {
    var factory;

    if (typeof aURI !== "string") {
      throw new Error(
          "load() was passed unexpected non-string parameter: "+ aURI);
    }

    factory = evaluate(fetch(aURI), aURI);

    factory.name = aURI; // for debugging
    return factory;
  }

  function constructUrlResolver(aPath) {
    var urls = {}; // will be the urls module from Chiron

    BACKSTAGE.chiron.urls(null, urls, null);

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
          throw new Error("URL '" + aURL +
              "' passed to resolve() is not a string.");
      }

      if (!aBaseURL || aURL[0] !== ".") {
        aBaseURL = aPath;
      }

      return urls.resolve(aURL, aBaseURL);
    }

    return resolve;
  }

  // constructor for the 'sys' or 'system' object
  function constructSys() {
    function print(msg, label) {
      label = label || "log";
      msg = ((typeof msg === "undefined") ? "undefined" : msg +"");
      BACKSTAGE.platform.console.log(label +": "+ msg +"\n");
    }

    return {platform: BACKSTAGE.platform, print: print};
  }

  // There is one single module loading system cache that is shared among all
  // processes.  It is designed so that developers using the module system can
  // restart it during development without restarting the platform browser.
  // There is also an option for users to spawn new processes and those
  // processes each construct their own cache.
  moduleCache = {};

  // constructor for the require object/function made available to modules.
  function constructRequire(aBaseId, aContinuation) {
    // will become the public require() object for the new module
    function pub(aId) {
      if (typeof aId !== "string") {
        throw new Error("Unexpected module id passed to require(): "+ aId);
      }
      return aContinuation.sandbox(aId, aBaseId, aContinuation);
    }

    pub.loader = aContinuation.loader;
    pub.main = aContinuation.main;
    return pub;
  }

  function sandbox(aID, aBaseID, a) {
    var factory, deliberateEx;

    aID = a.loader.resolve(aID, aBaseID);

    if (!Object.prototype.hasOwnProperty.call(a.cache, aID)) {
      factory = a.loader.load(aID);
      a.cache[aID] = {};
      try {
        factory(
          a.cache[aID], // exports
          constructRequire(aID, a), // require
          {id: aID}, // module
          a.system, // system as 'sys'
          a.system); // system as 'system'
      } catch(factoryEx) {
        delete a.cache[aID];
        deliberateEx = new Error();
        throw BACKSTAGE.moduleError(
                          aID,
                          factoryEx.message,
                          factoryEx.lineNumber,
                          deliberateEx.lineNumber,
                          192);
        // todo: the offset number (the last param to moduleError() is
        // dependent on how many lines we are from the evaluation point in
        // this file, and as such, is subject to failure if any code changes
        // are made between here and there.  Is there a way to set this
        // programmatically???
      }
    }

    return a.cache[aID];
  }

  // There may be any number of module processes running at any time
  // which users will start by calling BACKSTAGE.run()
  function createNewModuleProcess(a) {
    var continuation = {
      system: constructSys(),
      cache: a.cache,
      loader: {
        fetch: fetch,
        evaluate: evaluate,
        resolve: constructUrlResolver(a.path),
        load: load
      },
      sandbox: sandbox
    };
    continuation.main = continuation.loader.resolve(a.id);

    return sandbox(a.id, a.path, continuation);
  }

  BACKSTAGE.getModuleLoader = function getModuleLoader(aPath) {
    var resolve = constructUrlResolver(aPath);

    if (typeof aPath !== "string") {
      throw new Error("Unexpected path passed to run(): "+ aPath);
    }

    function run(aID, aSpawn) {
      var main, spawnedCache;
      
      main = resolve(aID);

      if (typeof aID !== "string") {
        throw new Error("Unexpected module id passed to run(): "+ aID);
      }

      if (!Object.prototype.hasOwnProperty.call(processes, main)) {
        processes[main] = createNewModuleProcess(
            {path: aPath, id: aID, cache: moduleCache});
      } else if (aSpawn) {
        spawnedCache = {};
        return createNewModuleProcess(
            {path: aPath, id: aID, cache: spawnedCache});
      }
      return processes[main];
    }
    
    run.loader = {
      fetch: fetch,
      evaluate: evaluate,
      resolve: resolve
    };

    return run;
  };

  (function init() {
    var ev;

    BACKSTAGE.run = BACKSTAGE.getModuleLoader("resource://kixx/packs/");

    BACKSTAGE.run("platform/init");

    ev = document.createEvent("Event");
    ev.initEvent("moduleLoaderReady", true, false);
    window.dispatchEvent(ev);
  }());

}, false);
