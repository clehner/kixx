/**
 * @fileOverview
 */

// todo: the PACKS_DIR name needs to come from sys configs
var PACKS_DIR = "packs";
var MAN_FILE = "manifest.json";

var PANEL = {
  launch: function panel_launch(aURL) {
    require("platform/tabs_1").create({url: aURL});
  }
};

window.addEventListener("moduleLoaderReady",
    function onModuleLoaderReady() {
      var fileUtils = require("services/os_1").file,
          console = require("platform/utils_1").console,
          panel = "",
          loc;

      loc = fileUtils.open("Kixx");
      loc.append(PACKS_DIR);
      fileUtils.contents(loc).forEach(
          function (file) {
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

      document.getElementById("panel").innerHTML = panel;
    }, false);
