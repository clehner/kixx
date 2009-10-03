var memcache = require("services/memcache_1");

/**
 */
exports.registry = function launcher_registry()
{
  return memcache.get("registry", "kixx-launcher");
};

/**
 */
exports.reg = function launcher_registerIcon(aName, aImgURL, aHandler)
{
  dump("reg panel icon for: "+ aName +"\n");
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
 * aCallback is optional
 */
exports.open = function launcher_open(aCallback) {
  // todo: handle invalid param
  // todo: panel url should be a constant
  require("./tabs_1").create({url:"chrome://kixx/content/packs/platform/panel.xhtml"});
}
