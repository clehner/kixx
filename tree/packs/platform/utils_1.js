// todo: sniff out the platform application and load the corresponding utils
// package
var platform = require("./firefox/utils_1");

exports.getCurrentWindow = platform.getCurrentWindow;
exports.installToolbarButton = platform.installToolbarButton;
exports.file = platform.file;
exports.openNewTab = platform.tabs.openNewTab;
exports.console = platform.console;
