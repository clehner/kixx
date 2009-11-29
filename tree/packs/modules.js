/**
 * @fileOverview
 * <p>This script tries to intelligently insert the BACKSTAGE object into the
 * global namespace.  The BACKSTAGE object lives on the background page and is
 * not immediately available when the browser starts up. Normally this is not a
 * problem except in the case where the user has set the browser to open with a
 * page that depends on the availability of the BACKSTAGE object.
 * </p><p>
 * Therefore, this script first defines a BACKSTAGE.getModuleLoader() function
 * that throws an error when called.  When the Kixx platform and the current
 * window are both loaded the BACKSTAGE.getModuleLoader() function is redefined
 * and a special event is fired on the window called "moduleLoaderReady".
 * Content pages can be notified that the BACKSTAGE object is ready for use by
 * listening to the "moduleLoaderReady" DOM event to be fired on the window.
 * </p>
 */
var BACKSTAGE = null;

(function () {
  var loaderReady = false,
      thisLoaded = false,
      
      bg = Components.classes["@mozilla.org/appshell/appShellService;1"].
                  getService(Components.interfaces.nsIAppShellService).
                  hiddenDOMWindow.document.getElementById("backstage").
                  contentWindow;

  function checkAndLoad() {
    if ((loaderReady || bg.BACKSTAGE.getModuleLoader) && thisLoaded) {
      BACKSTAGE = bg.BACKSTAGE;
      var ev = document.createEvent("Event");
      ev.initEvent("moduleLoaderReady", true, false);
      window.dispatchEvent(ev);
    }
  }

  function onModuleLoaderReady() {
    loaderReady = true;
    checkAndLoad();
  }

  // listen for the special "moduleLoaderReady" event from the background page
  bg.addEventListener("moduleLoaderReady", onModuleLoaderReady, false);

  window.addEventListener("unload",
      function treadmill_onUnload() {
        // prevent a leak when the window is reloaded
        bg.removeEventListener("moduleLoaderReady", onModuleLoaderReady, false);
      }, false);

  window.addEventListener("load",
      function (ev) {
        thisLoaded = true;
        checkAndLoad();
      }, false);
}());
