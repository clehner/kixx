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
    proc = BACKSTAGE.run("fireworksWebCMS/worker");
  } catch(e) {
    alert(e);
  }

  (function bind() {
    CMS = {};
    for (p in proc.module) {
      if (proc.module.hasOwnProperty(p)) {
        CMS[p] = proc.module[p];
      }
    };

    CMS.restart = function restart() {
      var newproc = proc.restart();
      proc = newproc;
      bind();
      alert("restarted process");
    };
  }());

  // we expect a start function on each page
  start();
}

window.addEventListener("moduleLoaderReady", onLoad, false);

window.addEventListener("unload",
    function() {
      window.removeEventListener("moduleLoaderReady", onLoad, false);
    }, false);
