/**
 * @fileOverview
 */

// todo: #notCrossPlatform
// We need to determine what platform we are on before
// defining these functions

/**
 * Logs the given message to the browser console.
 * @param {string} aMessage The message to write.
 */
exports.log = function log(aMessage) {
  aMessage += ""; // convert to string
  Components.classes["@mozilla.org/consoleservice;1"].
    getService(Components.interfaces.nsIConsoleService).
    logStringMessage(a);
};

/**
 * Prints the given error message to the browser console.
 * @param {string} aMessage The message to write.
 */
exports.err = function err(aMessage) {
  aMessage += ""; // convert to string
  Components.utils.reportError(aMessage);
};
