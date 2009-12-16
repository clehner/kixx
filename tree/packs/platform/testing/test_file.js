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
    assert(fu.open("/platform/panel").location ===
        "/platform/panel/",
        "path property should be '/platform/panel/'. ("+
        fu.open("/platform/panel").location +")");

    // test multiple path parameters
    assert(fu.open("platform", "panel", "panel.html").leafName === "panel.html",
        "/platform/panel/panel.html leaf name is "+
        fu.open("platform", "panel", "panel.html").leafName);

    // test read method
    assert(fu.open("/platform/testing/testmods/simple.js").read() ===
        'exports.yeah = "W00t!";'+"\n",
        " read() is "+ fu.open("/platform/testing/testmods/simple.js").read());

    // test directory listing
    assert(fu.open("/platform/testing/testmods/").contents()[0].location ===
        "/platform/testing/testmods/mutated_import.js",
        "contents()[0].path is "+
        fu.open("/platform/testing/testmods/").contents()[0].location);
  };

  return pub;
}());
