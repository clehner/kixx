// todo: we need a way to resolve urls depending on the platform
// we're running on.
var launcher = require("platform", "0.1").launcher;
launcher.reg("shell",
    "chrome://kixx/content/shell/icon.png",
    require("shell", "0.1").launch);
