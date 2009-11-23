/**
 * @fileOverview Bootsrap Kixx BACKSTAGE
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
XMLHttpRequest: false
*/

"use strict";

// assign backstage to window for syntatic sugar
var BACKSTAGE = (function startBackstage() {
  var pub = {}, // the public api for BACKSTAGE

      moduleCache = {}, // the private module cache

      // todo: the platform object needs to dynamically detect what platform
      // we are actually running on
      // todo: FUEL only works for Firefox
      // https://developer.mozilla.org/en/FUEL/Application#See_also
      platform = Components.classes["@mozilla.org/fuel/application;1"].
                     getService(Components.interfaces.fuelIApplication),

      system = {};
      
  // the system object only has one method
  system.print = function (msg, label) {
      label = label || "log";
      msg = ((typeof msg === "undefined") ? "undefined" : msg +"");
      platform.console.log(label +": "+ msg +"\n");
  };

  // loader constructor
  function loader(thisPath) {
    var that = {}; // the public loader api

    function fetch(aURI) {
      var req = new XMLHttpRequest();

      // we do this because we don't want XHR to try to create a DOM
      req.overrideMimeType("text/plain");

      req.open("GET", aURI, false);
      // todo: use a timer so this does not block
      // for too long without raising an exception
      req.send(null);
      return req.responseText;
    }

    function evaluate(aText, aURI) {
      var mod; // the module we will load

      try {
        mod = eval(("(function (require, exports, sys, system) {" +
              aText +"})"));
        // todo: the second System() parameter is there for backward
        // compatability with modules that use "system" instead of "sys"
        // (Chiron), and should eventually be removed
      } catch (exception) {
        // todo: In eval(), the line numbers and file name get all foobarred
        // when an error occurs and all this mess doesn't do anything
        if (exception && !exception.message) {
          exception.message = 'Error';
        }
        try {
          try {
            eval("throw new Error()");
          } catch (deliberate) {
            if (typeof deliberate.lineNumber !== "undefined") {
              exception.message += ' at '+
                (exception.lineNumber - deliberate.lineNumber + 1);
            }
          }
          exception.message += ' in ' + aURI;
        } catch (ignore) {
        }
        throw exception;
      }
      return mod;
    }

    function resolve(aID) {
      var terms, first, parts;

      if(typeof aID !== "string") {
        throw new Error("Single parameter passed to require.loader.resolve() "+
            "is expected to be a string, not "+ typeof aID);
      }

      if(!/[\w\.]/.test(aID[0])) {
        throw new Error("Single parameter passed to require.loader.resolve() "+
            "must start with a-z, A-Z, 0-9, _, or ., not '"+ aID[0] +"'");
      }

      if(aID[0] !== ".") {
        // path from the root module dir
        return aID +".js";
      }

      terms = aID.split("/");
      first = terms.shift();

      if(first === ".") {
        // path from the current dir
        return (thisPath +"/"+ terms.join("/") +".js");
      }

      if(first !== "..") {
        // at this point we are expecting the first token to be ".."
        throw new Error("require(): Invalid module id path'"+ aID +"'");
      }

      parts = thisPath.split("/");
      parts.pop(); // moves us back one dir

      return (parts.join("/") +"/"+ terms.join("/") +".js");
    }

    function normalize(aResolved) {
      // todo: base require url needs to be set in sys configs
      // according to the platform we're on
      var base = "resource://kixx/packs/";

      return base + aResolved;
    }

    function load(aID) {
      var uri = normalize(resolve(aID));
      // todo: we need a try / catch here to catch syntax errors
      return evaluate(fetch(uri), uri);
    }

    that.fetch = fetch;
    that.evaluate = evaluate;
    that.resolve = resolve;
    that.normalize = normalize;
    that.load = load;
    return that;
  }

  function getModuleLoader(thisMain, thisPath, thisID) {
    // By making the loader private before copying it over to require.loader we
    // prevent any modifications made by the caller to affect its use within
    // the require() function.
    var thisLoader = loader(thisPath);

    function that(aID) {
      var modID,
          terms,
          newPath,
          main,
          exports,
          factory;

      modID = thisLoader.resolve(aID);

      // if this module has already been loaded, just return it.
      if(moduleCache[modID]) {
        return moduleCache[modID];
      }

      terms = modID.split("/");
      terms.pop();
      newPath = terms.join("/");

      // MAIN is the module that started this thread, and the name that
      // will travel with it throughout it's life
      main = thisMain || modID;

      moduleCache[modID] = {}; // this object will become the module
      exports = moduleCache[modID];
      factory = thisLoader.load(aID);

      // todo: we need nested try / catch here to catch weird eval errors
      factory(that(main, newPath, modID), exports, system, system);
      // todo: the second System() parameter is there for backward compatability
      // with modules that use "system" instead of "sys" (Chiron), and should
      // eventually be removed

      return exports;
    }

    that.id = thisID;
    that.main = thisMain;
    that.loader = thisLoader;

    return that;
  }

  pub.platform = platform;
  pub.require = getModuleLoader("", "", "");
}());
