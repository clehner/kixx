// todo: we need a way to resolve urls depending on the platform
// we're running on.
var launcher = require("platform/launcher_1");
launcher.reg("shell",
    "chrome://kixx/content/packs/shell/icon.png",
    function launch()
    {
      require("platform/tabs_1")
        .create({url: "chrome://kixx/content/packs/shell/shell.xhtml"});
    });
