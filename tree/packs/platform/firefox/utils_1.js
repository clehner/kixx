// todo: replace dump() with logging functionality
exports.MOZID = "kixx@fireworksproject.com";

// !gotcha: this does not necessarily return the browser window
// todo: maybe this should only return the most recent browser window
// to be more inline with chromium?
exports.getCurrentWindow = function getCurrentWindow(aCallback)
{
  // todo: this should be an assert rather than a thrown error
  if(typeof aCallback != "function") {
    throw new Error("platform.utils.firefox.utils.getCurrentWindow() "+
        "must be passed a callback function");
  }
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]  
             .getService(Components.interfaces.nsIWindowMediator);  
  aCallback(wm.getMostRecentWindow("navigator:browser"));
}

var tabs = {};

// todo: make this follow the platform agnostic api in 'platform" module,
// and return a tab object to the callback
tabs.openNewTab = function openNewTab(aProps, aCallback)
{
  var url = aProps.url || "about:blank";
  var selected = aProps.selected || true;
  exports.getCurrentWindow(function openTheTab(win)
    {
      var browser = win.gBrowser;
      var tab = browser.addTab(url);
      if(selected)
        browser.selectedTab = tab;
      aCallback(tab);
    });
}

exports.installToolbarButton = function installToolbarButton(aChromeWin)
{
  dump("installing ui\n");
  // todo: there should be a constant for the toolbar-button id
  var buttonId = "kixx-launcher-toolstrip";

  function addToolbarButtonListener()
  {
    dump("installing toolbar listener...");
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
      dump(" success\n");
    } catch(e) {
      Components.utils.reportError(e);
      dump(" skipped\n");
      // if the user has removed the button, it will not be there.
    }
  }

  // todo: is this still needed??? lazy import of annodb to prevent
  // circular dependency and infinite recursion
  var annodb = require("services/annodb_1");

  // check to see if we have installed the button before
  annodb.get("toolbar-button-installed", exports.MOZID,
  function(success, result) {
    dump("installing toolbar button...");
    /*
     * todo: remove this snippet
    if(!success) {
      dump("could not read annodb\n");
      Components.utils.reportError(result);
      return;
    }
    */

    // if this script has run before, we don't want to re-install
    // a toolbar button that the user removed
    if(!(success ^ result)) {
      dump(" skipping\n");
      addToolbarButtonListener();
      return;
    }

    // this routine works for firefox only, no other apps are supported
    // (some easy tweaks should get it to work on onther Moz apps)
    var toolbarId = "nav-bar";
    var afterId = "home-button";

    var tb = aChromeWin.document.getElementById(toolbarId);
    var currentSet = tb.currentSet;

    // if the toolbar button is already there,
    // we don't want to re-install it.
    if(currentSet.indexOf(buttonId) != -1) {
      dump(" already done\n");
      addToolbarButtonListener();
      return;
    }


    var set = "";
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
    annodb.set("toolbar-button-installed", 1, exports.MOZID, function(){});

    dump(" completed\n");
    addToolbarButtonListener();
    return;
  });
}

/**
 */
var net = {};

/**
 */
net.download = {};

/**
 */
net.download.simplefetch = function download_simplefetch(url, target, aOnProgress, aOnComplete)
{
  var uri = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService)
                .newURI(url, null, null);
  
  var nsIWBP = Components.interfaces.nsIWebBrowserPersist;
  var persist = Components.
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
        aOnComplete(target);
      return true;
    }
  };

  // do the save
  persist.saveURI(uri, null, null, null, "", target);
};

/**
 * @namespace
 */
file = {};

file.open = function file_open(aLoc)
{
  var loc = "";
  switch(aLoc)
  {
    case "Profile":
      loc = "ProfD";
      break;

    case "Kixx":
      var em = Components.classes["@mozilla.org/extensions/manager;1"].
               getService(Components.interfaces.nsIExtensionManager);
      return em.getInstallLocation(exports.MOZID).getItemLocation(exports.MOZID);

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
  var fs = Components.classes["@mozilla.org/network/file-input-stream;1"].
              createInstance(Components.interfaces.nsIFileInputStream);
  var cs = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
              createInstance(Components.interfaces.nsIConverterInputStream);
  fs.init(file, -1, 0, 0);
  // todo: what are the concequences of using a converter?
  // is it needed?
  cs.init(fs, "UTF-8", 0, 0); // you can use another encoding here if you wish

  var data = "";
  var str = {};
  cs.readString(-1, str); // read the whole file and put it in str.value
  data = str.value;
  cs.close(); // this closes fstream

  return data;
};

/**
 */
file.write = function file_write(aFile, aContent)
{
  // todo: catch bad params
  //
  var fs = Components.classes["@mozilla.org/network/file-output-stream;1"].
             createInstance(Components.interfaces.nsIFileOutputStream);

  // todo: add parameter to append
  // use 0x02 | 0x10 to open file for appending.
  fs.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
  // write, create, truncate
  // In a c file operation, we have no need to set file mode with or operation,
  // directly using "r" or "w" usually.

  var cs = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
             createInstance(Components.interfaces.nsIConverterOutputStream);
  cs.init(fs, "UTF-8", 0, 0);
  cs.writeString(aContent);
  cs.close(); // this closes foStream
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

  var entries = file.directoryEntries;
  var list = [];

  while(entries.hasMoreElements())
  {
    var file = entries.getNext();
    file.QueryInterface(Components.interfaces.nsIFile);
    list.push(file);
  }

  // todo: how cool would it be to return an iterator instead???
  return list;
};

exports.file = file;
exports.tabs = tabs;
