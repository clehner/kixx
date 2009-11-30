exports.require = require;

exports.console = require("platform/utils_1").console;

exports.dumpObject = require("services/debug_1").dumpObject;

exports.props = require("services/debug_1").props;

exports.getWindows = function getWindows() {
  var grv;

  require("platform/windows_1").getCurrent(
      function (browser) {
        var i, rv = {};
        rv[browser.location.href] = browser;
        for (i = 0; i < browser.tabs.length; i++) {
          rv[browser.tabs[i].location.href] = browser.tabs[i];
        }
        grv = rv;
      });

  // make synchronous
  while(1) {
    if (grv) {
      return grv;
    }
  }
};
