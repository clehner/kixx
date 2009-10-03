var utils = require("./utils_1");
/**
 */
exports.getCurrent = function windows_getCurrent(aCallback) {
  if(typeof aCallback != "function") {
    throw new Error(
        "windows.getCurrent() expects a callback function as parameter.");
  }

  // todo: handle invalid params
  utils.getCurrentWindow(aCallback);
}
