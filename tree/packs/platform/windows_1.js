var utils = require("./utils_1");

/**
 */
exports.getCurrent = function windows_getCurrent(aCallback) {
  if (typeof aCallback !== "function") {
    throw new Error(
        "windows.getCurrent() expects a callback function as parameter.");
  }

  // todo: handle invalid params
  utils.getCurrentWindow(aCallback);
};

/**
 */
exports.getAll = function windows_getAll(aOpts, aCallback) {
  if (typeof aOpts !== "object") {
    throw new Error(
        "windows.getAll() expects an object as the first parameter.");
  }
  if (typeof aCallback !== "function") {
    throw new Error(
        "windows.getAll() expects a callback function as the second parameter.");
  }

  // todo: handle invalid params
  utils.getAllWindows(aCallback);
};
