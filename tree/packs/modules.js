(function (GlobalObject)
{
  // todo: this functionality should be moved into a firefox specific module.
  var shell = Components.classes["@mozilla.org/appshell/appShellService;1"]
            .getService(Components.interfaces.nsIAppShellService);
  var parentElement = shell.hiddenDOMWindow.document.documentElement;
  var iframe = parentElement.ownerDocument.getElementById("backstage");
  var backstage = iframe.contentWindow;
  GlobalObject.require = backstage.modules.getLoader();
})(this)

// the the module loading tool into this script
var require = (function getRequire() {
  // todo: this functionality should be moved into a firefox specific module.
  return Components.classes["@mozilla.org/appshell/appShellService;1"].
      getService(Components.interfaces.nsIAppShellService).
      hiddenDOMWindow.document.documentElement.
      ownerDocument.getElementById("backstage").contentWindow.modules.getLoader();
}());
