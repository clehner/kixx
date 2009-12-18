/**
 * @fileOverview Init routine to bootstrap the Kixx platform
 */

// main function (run from backstage)
function main() {
  // todo: #notCrossPlatform
  // We need to determine what platform we are on before
  // installing the toolbar button

  var log = require("services/log_1"),
      utils = require("platform/firefox/utils_1"),
      annodb = require("services/annodb_1"),

      // todo: there should be a constant for the toolbar-button id
      // (global constants module or something)
      buttonId = "kixx-launcher-toolstrip",
      
      chromeWin,

      toolbarId = "nav-bar", // id of the firefox toolbar

      // id of the button our toolbar button will follow (the home button) 
      afterId = "home-button",
      
      tb, // toolbar button xul element

      // the set of new buttons
      newButtonSet;
      
  chromeWin = utils.getMostRecentChromeWindow();

  function addToolbarButtonListener() {
    // todo: using this method of event registration, if the user removed the
    // toolbar button, and then replaces it, the event will have never been
    // registered.
    try {
      // add the event listener
      chromeWin.document.getElementById(buttonId).
        addEventListener("command",
        function onToolbarButtonCommand(e) {
          require("platform/tabs_1").create(
            {url: "chrome://kixx/content/packs/platform/panel/panel.html"});
        }, true);
    } catch(e) {
      // if the user has removed the button, it will not be there.
      Components.utils.reportError(e);
      log.warn("installToolbarButton() skipped add listener. "+
        "(the toolbar button may have been removed)");
    }
    log.info("Kixx platform loaded.");
  }

  // if this script has run before, we don't want to re-install
  // a toolbar button that the user removed
  if (annodb.get("toolbar-button-installed", utils.MOZID)) {
    addToolbarButtonListener();
    return;
  }

  tb = chromeWin.document.getElementById(toolbarId);

  // if the toolbar button is already there,
  // we don't want to re-install it.
  if(tb.currentSet.indexOf(buttonId) !== -1) {
    addToolbarButtonListener();
    return;
  }

  newButtonSet = ((currentSet.indexOf("urlbar-container") !== -1) ?
      // Place the button before the urlbar
      tb.currentSet.replace(/urlbar-container/, buttonId +",urlbar-container") :
      // Place the button at the end of the urlbar
      (tb.currentSet + buttonId));

  tb.setAttribute("currentset", newButtonSet);
  tb.currentSet = newButtonSet;

  chromeWin.document.persist("nav-bar", "currentset");
  // If you don't do the following call, funny things happen
  try {
    chromeWin.BrowserToolboxCustomizeDone(true);
  }
  catch (e) { }
  annodb.set("toolbar-button-installed", 1, utils.MOZID);
  addToolbarButtonListener();
}

if (require.main === module.id) {
  main();
}
