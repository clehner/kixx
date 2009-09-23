//
// This init script is executed within a JavaScript closure, meaning that no
// symbols are added to the global scope (chrome window) when this script is
// executed from the <script> tag in the overlay.xul file.
//
// todo: what are the concequences of this routine when the user opens a
// new browser window?
//
(function() {
  // locate all the init scripts in the init dir
  let em = Components.classes["@mozilla.org/extensions/manager;1"].
           getService(Components.interfaces.nsIExtensionManager);
  let file = em.getInstallLocation("kixx@fireworksproject.com")
    .getItemFile("kixx@fireworksproject.com", "init");
  let entries = file.directoryEntries;

  // for each init script:
  while(entries.hasMoreElements())
  {
    let init = entries.getNext();
    init.QueryInterface(Components.interfaces.nsIFile);
    let url = "resource://kixx/init/"+ init.leafName;

    var sl = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader);

    // create a sandbox containing the require object
    let sandbox = {}; 
    sandbox.require = Components.utils.import(
      "resource://kixx/require.js", null).require;

    // eval this init script in the ghetto sandbox
    //
    // within the init scripts:
    // 'this' will refer to the sandbox,
    // 'window' refers to the chrome window
    sl.loadSubScript(url, sandbox);
  }
})();
