var FT = (function () {
  var pub = {},
      timer;

  function assert(condition, message) {
    if (!condition) {
      throw new Error("File Utils Testing (assertion failed): "+ message);
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

    assert(fu.open("/platform/panel").isDirectory(),
        "/platform/panel should be a directory.");
    assert(fu.open("/platform/panel/panel.html").isFile(),
        "/platform/panel/panel.html should be a file.");
    
    // test our own path property
    assert(fu.open("/platform/panel/panel.html").location ===
        "/platform/panel/panel.html",
        "path property should be '/platform/panel/panel.html'. ("+
        fu.open("/platform/panel/panel.html").location +")");

    // test multiple path parameters
    assert(fu.open("platform", "panel", "panel.html").leafName === "panel.html",
        "packs/platform/panel/panel.html leaf name should be "+
        fu.open("platform", "panel", "panel.html").leafName);
  };

  return pub;
}());
