/**
 * @fileOverview
 */

// todo: the PACKS_DIR name needs to come from sys configs
var PACKS_DIR = "packs";
var MAN_FILE = "manifest.json";

exports.getPanel = function getPanel() {
  var fileUtils = require("platform/file_1"),
      console = require("platform/console_1"),
      panel = "",
      loc;

  loc = fileUtils.open("Kixx");
  loc.append(PACKS_DIR);
  fileUtils.contents(loc).forEach(
      function panel_loadManifest(file) {
        var man, name = file.leafName;
        file.append(MAN_FILE);

        if (!file.exists() || !file.isFile()) {
          return;
        }

        try {
          man = JSON.parse(fileUtils.read(file));
        } catch(e) {
          console.err("Kixx Panel launcher was unable to read "+
            "manifest file for "+ name);
          return;
        }

        if (typeof man.launcher === "undefined" ||
          typeof man.launcher.icon !== "string" ||
          typeof man.launcher.url !== "string") {
          return;
        }

        panel += (
            '<a class="launcher-icon" href="chrome://kixx/content/packs/'+
            name +'/'+ man.launcher.url +
            '"><img src="chrome://kixx/content/packs/'+
            name +'/'+ man.launcher.icon +'" /></a>');
      });
  return panel;
}
