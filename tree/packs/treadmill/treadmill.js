// the the module loading tool into this script
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

if (typeof TREADMILL !== "object") {
  this.TREADMILL = {};
}

TREADMILL.jslint = function jslint(aFile) {
  var url, result;

  if (typeof JSLINT !== "function") {
    throw new Error("chrome://kixx/content/packs/jslint/fulljslint.js "+
        "must be included with a script tag for JSLint to work. ");
  }

  url = require.loader.normalize(require.loader.resolve(aFile.slice(0, -3)));
  result = JSLINT(require.loader.fetch(url));
  TREADMILL.appendOutput(
      (result ? "passed" : "failed"), JSLINT.report(false));
};

TREADMILL.appendOutput = function appendOutput(level, html) {
  var div = document.createElement("div");
  if (level === "failed") {
    div.setAttribute("class", "block-failed");
  }
  document.getElementById("treadmill").appendChild(div);
  div.innerHTML = html;
};
