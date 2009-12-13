exports.MOZID = "kixx@fireworksproject.com";

exports.getMostRecentChromeWindow = function getMostRecentChromeWindow() {
  return Components.classes["@mozilla.org/appshell/window-mediator;1"].
           getService(Components.interfaces.nsIWindowMediator).
           getMostRecentWindow("navigator:browser");
}
