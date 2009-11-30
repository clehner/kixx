exports.console = require("platform/utils_1").console;

exports.dumpObject = require("services/debug_1").dumpObject;

exports.viewLog = function viewLog() {
  var fileUtils = require("services/os_1").file,
      log,
      filename = "kixx.log";

  log = fileUtils.open("Profile");
  log.append(filename);
  return fileUtils.read(log);
};
