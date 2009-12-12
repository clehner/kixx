/**
 * @fileOverview
 */
window.addEventListener("moduleLoaderReady",
    function onModuleLoaderReady() {
      document.getElementById("panel").innerHTML =
        BACKSTAGE.run("platform/panel_module").module.getPanel();
    }, false);
