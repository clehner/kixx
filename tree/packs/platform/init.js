/**
 * @fileOverview Init routine to bootstrap the Kixx platform
 */

// main function (run from backstage)
function main() {
  var log = require("services/log_1"),
      utils = require("platform/utils_1");

  require("./windows_1").getCurrent(
    function loadToolbarButton(aChromeWin) {
      var annodb = require("services/annodb_1");

      // todo: there should be a constant for the toolbar-button id
      // (global constants module or something)
      var buttonId = "kixx-launcher-toolstrip";

      function addToolbarButtonListener() {
        // todo: using this method of event registration, if the user removed the
        // toolbar button, and then replaces it, the event will have never been
        // registered.
        try {
          // add the event listener
          aChromeWin.document.getElementById(buttonId).
            addEventListener("command",
            function onToolbarButtonCommand(e) {
              require("../launcher_1").open(function(){});
            }, true);
        } catch(e) {
          // if the user has removed the button, it will not be there.
          Components.utils.reportError(e);
          log.warn("installToolbarButton() skipped add listener. "+
            "(the toolbar button may have been removed)");
        }
        log.info("Kixx platform loaded.");
      }

      // check to see if we have installed the button before
      annodb.get("toolbar-button-installed", utils.MOZID,
      function(success, result) {
        var toolbarId = "nav-bar", // id of the firefox toolbar

            // id of the button our toolbar button will follow (the home button) 
            afterId = "home-button"
            
            tb = aChromeWin.document.getElementById(toolbarId),

            // the set of new buttons
            newButtonSet;

        // if this script has run before, we don't want to re-install
        // a toolbar button that the user removed
        if(!(success ^ result)) {
          addToolbarButtonListener();
          return;
        }

        // if the toolbar button is already there,
        // we don't want to re-install it.
        if(tb.currentSet.indexOf(buttonId) != -1) {
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

        aChromeWin.document.persist("nav-bar", "currentset");
        // If you don't do the following call, funny things happen
        try {
          aChromeWin.BrowserToolboxCustomizeDone(true);
        }
        catch (e) { }
        annodb.set("toolbar-button-installed", 1, utils.MOZID, function(){});

        addToolbarButtonListener();
        return;
      });
    });
}

if (require.main === module.id) {
  main();
}
