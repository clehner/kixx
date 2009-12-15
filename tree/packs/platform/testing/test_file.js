var FT = (function () {
  var pub = {},
      timer;

  function assert(condition, message) {
    if (!condition) {
      throw new Error("Module Loader Testing (assertion failed): "+ message);
    }
  }

  timer = setTimeout(function () {
          assert(false, "moduleLoaderReady event timed out in 500 ms");
        }, 500);

  window.addEventListener("moduleLoaderReady",
      function onModuleLoaderReady() {
        clearTimeout(timer);
      }, false);

  pub.go = function go() {
    var fu = BACKSTAGE.run("platform/file_1"), ex;

    // run JSLint
    TREADMILL.jslint("platform/file_1", {maxlen: 80});

    // argument to open() must be a string
    try {
      fu.open({});
    } catch(e) {
      ex = true;
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
    }

    assert(fu.open("packs/platform/panel").isDirectory(),
        "packs/platform/panel should be a directory.");
    assert(fu.open("packs/platform/panel/panel.html").isFile(),
        "packs/platform/panel/panel.html should be a file.");
    
    // test our own path property
    assert(fu.open("packs/platform/panel/panel.html").location ===
        "packs/platform/panel/panel.html",
        "path property should be 'packs/platform/panel/panel.html'. ("+
        fu.open("packs/platform/panel/panel.html").location +")");
  };

  return pub;
}());
