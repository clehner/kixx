/**
 * @fileOverview Common features for all pages in the FWP CMS
 */

/**
 * @namespace The main CMS worker
 */
var CMS;

window.addEventListener("moduleLoaderReady",
    function () {
      var proc;

      window.removeEventListener("moduleLoaderReady", arguments.callee, false);

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

    }, false);
