const MOZID = "kixx@fireworksproject.com";

// !gotcha: this does not necessarily return the browser window
// todo: maybe this should only return the most recent browser window
// to be more inline with chromium?
function getCurrentWindow()
{
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]  
             .getService(Components.interfaces.nsIWindowMediator);  
  return wm.getMostRecentWindow("");
}

// todo: make this follow the platform agnostic api in 'platform" module,
// and return a tab object to the callback
function openNewTab(aProps, aCallback)
{
  let url = aProps.url || "about:blank";
  let selected = aProps.selected || true;
  let win = getCurrentWindow();
  let browser = win.gBrowser;
  let tab = browser.addTab(url);
  if(selected)
    browser.selectedTab = tab;
}

function installToolbarButton(aChromeWin)
{
  // todo: there should be a constant for the toolbar-button id
  let buttonId = "kixx-launcher-toolstrip";

  function addToolbarButtonListener()
  {
    // todo: using this method of event registration, if the user removed the
    // toolbar button, and then replaces it, the event will have never been
    // registered.
    try {
      // add the event listener
      aChromeWin.document.getElementById(buttonId).
        addEventListener("command",
        function onToolbarButtonCommand(e) {
          require("platform", "0.1").launcher.open();
        }, true);
      // todo: maybe the import of the 'platform' module should go
      // outside this function
    } catch(e) {
      // if the user has removed the button, it will not be there.
    }
  }

  aChromeWin.addEventListener("load",
    function firefox_installToolbarButton(e)
    {
      // lazy import of annodb to prevent
      // circular dependency and infinite recursion
      let annodb = require("annodb", "0.1");

      // check to see if we have installed the button before
      annodb.get("toolbar-button-installed", MOZID,
      function(success, result) {

        // if this script has run before, we don't want to re-install
        // a toolbar button that the user removed
        if(!(success ^ result)) {
          addToolbarButtonListener();
          return;
        }

        // this routine works for firefox only, no other apps are supported
        // (some easy tweaks should get it to work on onther Moz apps)
        let toolbarId = "nav-bar";
        let afterId = "home-button";

        let tb = aChromeWin.document.getElementById(toolbarId);
        let currentSet = tb.currentSet;

        // if the toolbar button is already there,
        // we don't want to re-install it.
        if(currentSet.indexOf(buttonId) != -1) {
          addToolbarButtonListener();
          return;
        }


        let set = "";
        // Place the button before the urlbar
        if(currentSet.indexOf("urlbar-container") != -1) {
          set = currentSet.replace(/urlbar-container/,
              buttonId +",urlbar-container");
        }
        else  // at the end
          set = currentSet + buttonId;

        tb.setAttribute("currentset", set);
        tb.currentSet = set;

        aChromeWin.document.persist("nav-bar", "currentset");
        // If you don't do the following call, funny things happen
        try {
          aChromeWin.BrowserToolboxCustomizeDone(true);
        }
        catch (e) { }
        annodb.set("toolbar-button-installed", 1, MOZID, function(){});

        addToolbarButtonListener();
        return;
      });
  },
  false);
}

/**
 */
var download = {};

/**
 */
download.simplefetch = function download_simplefetch(url, target, aOnProgress, aOnComplete)
{
  let uri = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService)
                .newURI(url, null, null);
  
  let nsIWBP = Components.interfaces.nsIWebBrowserPersist;
  let persist = Components.
    classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].
    createInstance(nsIWBP);
  persist.persistFlags = nsIWBP.PERSIST_FLAGS_BYPASS_CACHE |
                         nsIWBP.PERSIST_FLAGS_NO_CONVERSION |
                         nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
                         nsIWBP.PERSIST_FLAGS_CLEANUP_ON_FAILURE;

  persist.progressListener =
  {
    onProgressChange: function onProgressChange(aWebProgress,
                          aRequest,
                          aCurSelfProgress,
                          aMaxSelfProgress,
                          aCurTotalProgress,
                          aMaxTotalProgress)
    {
      /*
      kdump(aWebProgress +", "+
            aRequest +", "+
            aCurSelfProgress +", "+
            aMaxSelfProgress +", "+
            aCurTotalProgress +", "+
            aMaxTotalProgress);
            */

      if(aMaxSelfProgress == -1)
        aOnProgress(-1);

      else if(aCurSelfProgress > 0)
        aOnProgress((aCurSelfProgress / aMaxSelfProgress) * 100);

      return true;
    },

    onStatusChange: function onStatusChange(aWebProgress, aRequest, aStatus, aMessage)
    {
      //kdump(aWebProgress +", "+ aRequest +", "+
       //     aStatus +", "+ aMessage);
      // no operation
      return true;
    },

    onStateChange: function onStateChange(aWebProgress, aRequest, aState, aStatus)
    {
      //kdump(""+ aWebProgress +", "+ aRequest.isPending() +", "+ aStatus +", "+ aStatus);

      if(!aRequest.isPending())
        aOnComplete();
      return true;
    }
  };

  // do the save
  persist.saveURI(uri, null, null, null, "", target);
};

/**
 * @namespace
 */
let file = {};

file.open = function file_open(aLoc)
{
  let loc = "";
  switch(aLoc)
  {
    case "Profile":
      loc = "ProfD";
      break;

    case "Kixx":
      let em = Components.classes["@mozilla.org/extensions/manager;1"].
               getService(Components.interfaces.nsIExtensionManager);
      return em.getInstallLocation(MOZID).getItemLocation(MOZID);

    default:
      // todo: use the debug module to handle errors
      throw new Error("firefox.file.open(): "+
          "invalid location alias; "+ aLoc);
  }

  return Components.classes["@mozilla.org/file/directory_service;1"].
           getService(Components.interfaces.nsIProperties).
           get(loc, Components.interfaces.nsIFile);
}

// todo: there should be a max bytes parameter for this
file.read = function file_read(file)
{
  let fs = Components.classes["@mozilla.org/network/file-input-stream;1"].
              createInstance(Components.interfaces.nsIFileInputStream);
  let cs = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
              createInstance(Components.interfaces.nsIConverterInputStream);
  fs.init(file, -1, 0, 0);
  // todo: what are the concequences of using a converter?
  // is it needed?
  cs.init(fs, "UTF-8", 0, 0); // you can use another encoding here if you wish

  let data = "";
  let(str = {}) {
    cs.readString(-1, str); // read the whole file and put it in str.value
    data = str.value;
  }
  cs.close(); // this closes fstream

  return data;
};

/**
 */
file.contents = function file_contents(file)
{
  if(!(file instanceof Components.interfaces.nsIFile)) {
    throw new Error(
        "file.contents() expects a file object as the single parameter");
  }
  if(!file.isDirectory)
    throw new Error("file.contents() expects a directory file object");

  let entries = file.directoryEntries;
  let list = [];

  while(entries.hasMoreElements())
  {
    let file = entries.getNext();
    file.QueryInterface(Components.interfaces.nsIFile);
    list.push(file);
  }

  // todo: how cool would it be to return an iterator instead???
  return list;
};
