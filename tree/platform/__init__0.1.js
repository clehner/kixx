// todo: this needs to do a check to see what platform we are on
// before requiring the platform utils
var platformUtils = require("firefox", "0.1");

var memcache = require("memcache", "0.1");

/**
 */
var windows = {};

/**
 */
windows.getCurrent = function windows_getCurrent(aCallback) {
  // todo: is this the right syntax for the chromium api??
  // todo: handle invalid param
  aCallback(platformUtils.getCurrentWindow());
}

/**
 */
var tabs = {};

/**
 *
 *  windowId
 *    The window to create the new tab in. Defaults to the current window.
 *
 *  index
 *    The position the tab should take in the window. The provided value will be
 *    clamped to between zero and the number of tabs in the window.
 *
 *  url
 *    The URL to navigate the tab to initially. Fully-qualified URLs must include
 *    a scheme (i.e. 'http://www.google.com', not 'www.google.com'). Relative
 *    URLs will be relative to the current page within the extension. Defaults to
 *    the New Tab Page.
 *
 *  selected
 *    Whether the tab should become the selected tab in the window. Defaults to
 *    true
 */
// todo: make this follow the api, and return a tab object to the callback
tabs.create = function tabs_create(aCreateProperties, aCallback)
{
  platformUtils.openNewTab(aCreateProperties, aCallback);
};

/**
 */
var launcher = {};

/**
 */
launcher.registry = function launcher_registry()
{
  return memcache.get("registry", "kixx-launcher");
};

/**
 */
launcher.reg = function launcher_registerIcon(aName, aImgURL, aHandler)
{
  dump("register "+ aName +"\n");
  // todo: use error handling module
  if(typeof(aName) != "string") {
    throw new Error(
        "platform.launcher.reg() expects a string passed as a name.");
  }
  if(typeof(aImgURL) != "string") {
    throw new Error(
        "platform.launcher.reg() expects a string passed as an image url.");
  }
  if(typeof(aHandler) != "function") {
    throw new Error(
        "platform.launcher.reg() expects a function passed as a handler.");
  }

  var reg = memcache.get("registry", "kixx-launcher");
  if(!reg) reg = {};
  reg[aName] = {icon: aImgURL, handler: aHandler};
  memcache.set("registry", reg, 0, "kixx-launcher");
};

/**
 */
launcher.open = function launcher_open(aCallback) {
  // todo: handle invalid param
  // todo: panel url should be a constant
  tabs.create({url:"chrome://kixx/content/platform/panel.xhtml"});
}
