// todo: use a central error handing module

// assign backstage to window for syntatic sugar
var backstage = window;
var cache = {};
var modules = {};

function burning()
{
  return false;
}

function ignition()
{
  return false;
}

(function(Backstage)
{
  var CACHE = {};

  Backstage.cache.getOrCreateNamespace =
  function cache_getOrCreateNamespace(aNamespace)
  {
    if(CACHE[aNamespace]) return CACHE[aNamespace];
    CACHE[aNamespace] = {};
    return CACHE[aNamespace];
  }

  Backstage.cache.clearNamespace =
  function cache_clearNamespace(aNamespace)
  {
    delete CACHE[aNamespace];
  }

  Backstage.cache.clear =
  function cache_clear()
  {
    CACHE = {};
  }
})
(backstage);

(function (Backstage)
{
  var CACHE = Backstage.cache.getOrCreateNamespace("KIXX_MODULE_CACHE");

  function System()
  {
    var system = {};
    system.print = function system_print(msg, label)
    {
      // todo: better output formatting for sys.print();
      // todo: platform agnostic sys.print(); (console.log() in Chromium)
      label = label || "log";
      dump(label +": "+ msg +"\n");
    };
    return system;
  }

  function Require(MAIN, PATH, ID)
  {
    var loader = Loader(PATH);
    function require(id)
    {
      var modID = loader.resolve(id);

      // if this module has already been loaded, just return it.
      if(CACHE[modID]) return CACHE[modID];

      var terms = modID.split("/");
      terms.pop();
      var newPath = terms.join("/");

      // MAIN is the module that started this thread, and the name that
      // will travel with it throughout it's life
      MAIN = MAIN || modID;

      CACHE[modID] = {}; // this object will become the module
      var exports = CACHE[modID];
      var factory = loader.load(id);
      // todo: we need nested try / catch here to catch weird eval errors
      // todo: the second System() parameter is there for backward compatability
      // with modules that use "system" instead of "sys" (Chiron), and should
      // eventually be removed
      factory(Require(MAIN, newPath, modID), exports, System(), System());

      return exports;
    }

    require.id = ID;
    require.main = MAIN;
    require.loader = loader;

    return require;
  }

  function Loader(path)
  {
    var loader = {};

    loader.load = function load(id) {
      var uri = loader.normalize(loader.resolve(id));
      // todo: we need a try / catch here to catch syntax errors
      return loader.evaluate(loader.fetch(uri), uri);
    };

    loader.fetch = function fetch(uri)
    {
      var req = null;

      // todo: can we do this in Chromium and Mozilla???
      req = new XMLHttpRequest();

      req.overrideMimeType("text/plain");
      req.open("GET", uri, false);
      try {
        // todo: use a timer so this does not block startup of the browser
        // for too long
        req.send(null);
      } catch(e) {
        // todo: only handle the "not found" error
        // todo: system error handling should get logged errors
        throw new Error("require(): could not locate file at "+ uri);
      }
      return req.responseText;
    };

    loader.evaluate = function evaluate(text, uri)
    {
      // todo: the second System() parameter is there for backward compatability
      // with modules that use "system" instead of "sys" (Chiron), and should
      // eventually be removed
      text = (
          "(function (require, exports, sys, system) {" +
              text +
          "})");

      try {
        return Backstage.eval(text);
      } catch (exception) {
      // todo: In eval(), the line numbers and file name get all foobarred when
      // an error occurs and all this mess doesn't do anything
        if (exception && !exception.message)
          exception.message = 'Error';
        try {
          try {
            eval("throw new Error()");
          } catch (deliberate) {
            if (deliberate.lineNumber !== undefined) {
              exception.message += ' at '+
                (exception.lineNumber - deliberate.lineNumber + 1);
            }
          }
          exception.message += ' in ' + uri;
        } catch (ignore) {
        }
        throw exception;
      }
    };

    loader.resolve = function resolve(id)
    {
      // todo: parameter checks for sanity
      //  -- test for invalid first characters like "/"
      if(id.charAt(0) != ".")
        return id +".js";

      var terms = id.split("/");
      var first = terms.shift();

      if(first == ".")
        return (path +"/"+ terms.join("/") +".js");

      if(first !== "..")
        throw new Error("require(): Invalid module id path'"+ id +"'");

      var parts = path.split("/");
      parts.pop();

      return (parts.join("/") +"/"+ terms.join("/") +".js");
    }

    loader.normalize = function normalize(resolved)
    {
      // todo: base require url needs to be set in sys configs
      // according to the platform we're on
      var base = "resource://kixx/packs/";

      return base + resolved;
    }


    return loader;
  }

  // todo: get rid of these tests
 /*
  var xloader = Loader();
  var factory = xloader.evaluate("exports.type = typeof(require);");
  var ex = {};
  factory(function (){}, ex, {});
  dump(ex.type +"\n");

  dump(xloader.resolve("base") +"\n");
  dump(xloader.resolve("base_0.1") +"\n");
  //dump(xloader.resolve(".bear") +"\n");
  dump(xloader.resolve("./bear") +"\n");
  //dump(xloader.resolve("..bear") +"\n");
  dump(xloader.resolve("../bear") +"\n");
  //dump(xloader.resolve("/bear") +"\n");
  dump(xloader.resolve("foo/bear") +"\n");
  dump(xloader.resolve("../foo/bear") +"\n");
  dump(xloader.resolve("./foo/bear") +"\n");
  //dump(xloader.resolve("..foo/bear") +"\n");
  //dump(xloader.resolve(".foo/bear") +"\n");
  */

  // getLoader() is injected to backstage.modules.getLoader().
  // It simply returns the module loader (require())
  Backstage.modules.getLoader =
  function modules_getLoader() {
    return Require("","","");
  }
})
(backstage);

backstage.require = backstage.modules.getLoader();

// check to see if the system is already started by calling burning() and if
// not, start the kixx system by importing utility modules and then loading the
// init module for each package 
function start()
{
  // start cannot be called if the system has already been started
  if(backstage.burning()) {
    dump("we're already burning\n");
    return;
  }

  // prevent multiple calls to start while the system is starting
  if(backstage.ignition()) {
    dump("we already pushed the ignition button\n");
    return;
  }

  dump("ignition\n");

  backstage.ignition = function backstage_ignition()
  {
    return true;
  }

  var CHROME_LOADED = false;
  // todo: On the Mozilla platform, this backstage window is not loaded until the "load" event
  // for the main browser window is fired.  What happens with Chromium???
  CHROME_LOADED = true;
  var BACKGROUND_LOADED = false;
  var PACKMGR_INIT = false;

  var pkg = require("platform/pkgmgr_1");

  function IGNITE()
  {
    var packs = pkg.getUnpackedList();
    // todo: background object should handle cases where packages
    // do not have an init module 
    dump("initializing packs\n");
    for(var name in packs)
      require(name +"/init");

    backstage.burning = function backstage_burning()
    {
      return true;
    };
    dump("burning\n");
  }

  window.addEventListener("load", function handleBackstageLoad(e)
      {
        dump("background loaded\n");
        BACKGROUND_LOADED = true;
        if(CHROME_LOADED && PACKMGR_INIT && BACKGROUND_LOADED) IGNITE();
      },
      false);

  /*
   * todo: remove this snippet
  require("platform/windows_1").getCurrent(
    function returnChromeWindow(chromeWin)
    {
      chromeWin.addEventListener("load", function handleChromeWinLoad(e)
      {
        dump("chrome window is loaded\n");
        CHROME_LOADED = true;
        if(CHROME_LOADED && PACKMGR_INIT && BACKGROUND_LOADED) IGNITE();
      },
      false);
    }
  );
  */

  pkg.init(function pkgmgr_init_callback()
      {
        dump("package manager is lit\n");
        PACKMGR_INIT = true;
        if(CHROME_LOADED && PACKMGR_INIT && BACKGROUND_LOADED) IGNITE();
      });
}

// clear the cache
// todo: teardown() should be a stub if we are on the Chromium platform
// since it provides its own restart functionality
function teardown()
{
  // todo: teardown must close or reload all windows and tabs using require()
  // to get a true restart and prevent leaks
}

// todo: restart() should be a stub if we are on the Chromium platform
// since it provides its own restart functionality
function restart()
{
  teardown();
  var iframe = parent.document.getElementById("backstage");
  iframe.contentWindow.location.reload(true);
}

// fire it up
backstage.start();
