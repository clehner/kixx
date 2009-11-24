/**
 * @fileOverview
 * <p>This script tries to intelligently insert the require() object into the
 * global namespace.  The require() object lives on the background page and is
 * not immediately available when the browser starts up. Normally this is not a
 * problem except in the case where the user has set the browser to open with a
 * page that depends on the availability of the require() object.
 * </p><p>
 * Therefore, this script first defines a require() function that throws an
 * error when called.  When the window loads (implying that the background page
 * has loaded as well), then the require() object is redefined and a special
 * event is fired on the window called "moduleLoaderReady".  Content pages can
 * be notified that the require() object is ready for use by listening to the
 * "moduleLoaderReady" DOM event to be fired on the window.
 * </p>
 */
var require = function tempRequire(arg) {
  throw new Error("The require() object is not yet available. "+
      "(called by "+ arguments.callee.caller.name +"() for "+ arg +")");
};

(function () {
  var loaderReady = false,
      thisLoaded = false,
      
      bg = Components.classes["@mozilla.org/appshell/appShellService;1"].
                  getService(Components.interfaces.nsIAppShellService).
                  hiddenDOMWindow.document.getElementById("backstage").
                  contentWindow;

  function checkAndLoad() {
    if ((loaderReady || bg.BACKSTAGE) && thisLoaded) {
      require = bg.BACKSTAGE.require;
      var ev = document.createEvent("Event");
      ev.initEvent("moduleLoaderReady", true, false);
      window.dispatchEvent(ev);
      return;
    }
  }

  // listen for the special "moduleLoaderReady" event from the background page
  bg.addEventListener("moduleLoaderReady",
      function (ev) {
        loaderReady = true;
        checkAndLoad();
        // prevent a leak when the window is reloaded
        bg.removeEventListener("moduleLoaderReady", arguments.callee, false);
      }, false);

  window.addEventListener("load",
      function (ev) {
        thisLoaded = true;
        checkAndLoad();
      }, false);
}());
