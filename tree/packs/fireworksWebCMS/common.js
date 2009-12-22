/**
 * @fileOverview Common features for all pages in the FWP CMS
 */

/**
 * @namespace The main CMS worker
 */
var CMS;

function onLoad() {
  var proc;

  try {
    CMS = BACKSTAGE.run("fireworksWebCMS/worker");
  } catch(e) {
    alert(e);
  }

  CMS.restart = function restart() {
    alert("Restart functionality is disabled.");
  }

  // we expect a start function on each page
  start();
}

window.addEventListener("moduleLoaderReady", onLoad, false);

window.addEventListener("unload",
    function() {
      window.removeEventListener("moduleLoaderReady", onLoad, false);
    }, false);
