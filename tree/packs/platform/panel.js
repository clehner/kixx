/**
 * @fileOverview
 */
var PANEL = {
  launch: function panel_launch(aURL) {
    require("platform/tabs_1").create({url: aURL});
  }
};

window.addEventListener("moduleLoaderReady",
    function onModuleLoaderReady() {
      document.getElementById("panel").innerHTML =
        BACKSTAGE.run("platform/panel_module").getPanel();
    }, false);
