var MLT = (function () {
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
    var resolve, fetch, evaluate, fileUtils;

    assert(typeof BACKSTAGE === "object",
      'typeof BACKSTAGE === "object" ('+ typeof BACKSTAGE +')');
    assert(typeof BACKSTAGE.getModuleLoader === "function",
      'typeof BACKSTAGE.getModuleLoader === "function" ('+
        typeof BACKSTAGE.getModuleLoader +')');
    assert(typeof BACKSTAGE.getModuleLoader("a/location") === "function",
      'typeof BACKSTAGE.getModuleLoader() ('+
        typeof BACKSTAGE.getModuleLoader("a/location") +')');
    assert(typeof BACKSTAGE.getModuleLoader("a/location").loader === "object",
      'typeof BACKSTAGE.getModuleLoader().loader === "object" ('+
        typeof BACKSTAGE.getModuleLoader("a/location").loader +')');
    assert(typeof BACKSTAGE.getModuleLoader("a/location").loader.resolve === "function",
      'typeof BACKSTAGE.getModuleLoader().loader.resolve === "function" ('+
        typeof BACKSTAGE.getModuleLoader("a/location").loader.resolve +')');

    resolve = BACKSTAGE.getModuleLoader("resource://kixx/packs/").loader.resolve;

    assert(resolve("resource://kixx/packs/mod") === "resource://kixx/packs/mod",
      'resolve("resource://kixx/packs/mod") ('+
        resolve("resource://kixx/packs/mod") +')');

    assert(resolve("resource://kixx/packs/mod", "ignore me") === "resource://kixx/packs/mod",
      'resolve("resource://kixx/packs/mod") ('+
        resolve("resource://kixx/packs/mod") +')');
    assert(resolve("mymod", "resource://kixx/packs/") === "resource://kixx/packs/mymod",
      'resolve("mymod", "resource://kixx/packs/") ('+
        resolve("mymod", "resource://kixx/packs/") +')');
    assert(resolve("mymod", "/packs/") === "resource://kixx/packs/mymod",
      'resolve("mymod", "/packs/") ('+
        resolve("mymod", "/packs/") +')');
    assert(resolve("./mymod") === "resource://kixx/packs/mymod",
      'resolve("./mymod") ('+
        resolve("./mymod") +')');
    assert(resolve("../mymod") === "resource://kixx/mymod",
      'resolve("../mymod") ('+
        resolve("../mymod") +')');
    assert(resolve("rootPack", "resource://kixx/mymods/someOtherPack") ===
        "resource://kixx/packs/rootPack",
      'resolve("../mymod") ('+
        resolve("rootPack", "resource://kixx/mymods/someOtherPack") +')');

    fetch = BACKSTAGE.getModuleLoader("resource://kixx/packs/").loader.fetch;
    try {
      fetch("resource://kixx/index.htmlhttp://example.com");
      assert(false, "An error should be raised for "+
        "resource://kixx/index.htmlhttp://example.com");
    } catch(openEx) {
      assert(openEx.constructor.name == "Error",
        'openEx.constructor == Error ('+
          openEx +')');
    }
    try {
      fetch("resource://kixx/index.html");
      assert(false, "An error should be raised for "+
        "resource://kixx/index.html");
    } catch(sendEx) {
      assert(sendEx.constructor.name == "Error",
        'sendEx.constructor == Error ('+
          sendEx +')');
    }

    // run JSLint
    TREADMILL.jslint("../kixxsys/backstage", {maxlen: 80});

    (function () {
      var a, b, err = false;

      a = BACKSTAGE.run("platform/testing/testmods/simple");

      b = BACKSTAGE.run("platform/testing/testmods/simple");

      // if the second parameter passed to run is not true (spawn),
      // it returns the already loaded process
      assert(a === b, "A module loaded without spawn should be the same.");

      b = BACKSTAGE.run("platform/testing/testmods/simple", true);
      assert(a !== b, "A module loaded with spawn set to true should not be the same.");
    }());

    evaluate = BACKSTAGE.run.loader.evaluate;
    try {
      evaluate("var ok = 'this line is ok';\nif () {");
    } catch(e) {
      assert(e.lineNumber === 2,
        "Get a correct line number from evaluate().("+ e +" : "+ e.lineNumber +")");
    }

    try {
      a = BACKSTAGE.run("platform/testing/testmods/throw_error");
    } catch(e) {
      assert(e.lineNumber === 5,
        "Get a correct line number from run().("+ e +" : "+ e.lineNumber +")");
    }

    try {
      BACKSTAGE.run("platform/testing/testmods/this_module_doesnot_exist");
    } catch(e) {
      assert(e.constructor.name === "Error",
        "Throw an internal exception.("+ e +")");
    }

    fileUtils = BACKSTAGE.run("platform/file_1");

    (function () {
      var file, val_1, val_2, imported;
      file = fileUtils.open("Kixx");
      file.append("packs");
      file.append("platform");
      file.append("testing");
      file.append("testmods");
      file.append("mutated_import.js");
      fileUtils.write(file, "exports.myNumber = 7;");
      imported = BACKSTAGE.run("platform/testing/testmods/mutated_import");
      val_1 = imported.myNumber;
      fileUtils.write(file, "exports.myNumber = 9;");

      // this time we spawn a new process
      imported = BACKSTAGE.run("platform/testing/testmods/mutated_import", true);
      val_2 = imported.myNumber;

      assert(val_1 !== val_2,
        "val_1 === val_2, ("+ val_1 +" === "+ val_2 +")");
    }());

    (function () {
      var scopes,
          ml = BACKSTAGE.getModuleLoader("resource://kixx/packs/");

      scopes = ml("platform/testing/testmods/eval_globals");

      assert(typeof scopes.checkBackstage() === "object",
        "backstage scope should not be available. "+
        "("+ typeof scopes.checkBackstage() +")");

      try {
        scopes.checkClosure();
        assert(false, "no closure in eval");
      } catch(e) {
        assert(e.constructor.name === "ReferenceError", "no closure in eval ("+e+")");
      }
      
      try {
        scopes.checkOuter();
        assert(false, "no outer in eval");
      } catch(e) {
        assert(e.constructor.name === "ReferenceError", "no outer in eval ("+e+")");
      }

      try {
        scopes.checkInner();
        assert(false, "no inner in eval");
      } catch(e) {
        assert(e.constructor.name === "ReferenceError", "no inner in eval ("+e+")");
      }
    }());

    (function testInteroperableJS() {
     var loader, listing, compliance, security;

     loader = BACKSTAGE.getModuleLoader("resource://kixx/packs/platform/testing/interoperablejs/trivial/");
     loader("program");

     listing = fileUtils.open("Kixx");
     listing.append("packs");
     listing.append("platform");
     listing.append("testing");
     listing.append("interoperablejs");

     compliance = listing.clone();
     compliance.append("compliance");
     fileUtils.contents(compliance).forEach(
       function (item) {
         if (item.leafName !== "ORACLE") {
           BACKSTAGE.getModuleLoader(
             "resource://kixx/packs/platform/testing/interoperablejs/compliance/"+
             item.leafName +"/")("program");
         }
       });

     security = listing.clone();
     security.append("security");
     fileUtils.contents(security).forEach(
       function (item) {
         // we don't run the sandbox tests
         if (item.leafName === "sandbox") {
           return;
         }
         BACKSTAGE.getModuleLoader(
           "resource://kixx/packs/platform/testing/interoperablejs/security/"+
           item.leafName +"/")("program");
       });
    }());
  };

  return pub;
}());
