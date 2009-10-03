(function (GlobalObject)
{
  // todo: this functionality should be moved into a firefox specific module.
  // the memcache module should remain platform agnostic
  var shell = Components.classes["@mozilla.org/appshell/appShellService;1"]
            .getService(Components.interfaces.nsIAppShellService);
  var parentElement = shell.hiddenDOMWindow.document.documentElement;
  var iframe = parentElement.ownerDocument.getElementById("backstage");
  var backstage = iframe.contentWindow;
  GlobalObject.require = backstage.modules.getLoader();
})(this)
