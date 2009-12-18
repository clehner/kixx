var ST = (function () {
  var pub = {},
      timer;

  function assert(condition, message) {
    if (!condition) {
      throw new Error("Storage Utils Testing (assertion failed): "+ message);
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
    var db = BACKSTAGE.run("services/storage_1"),
        ex, results, cxn, val,
        fu = BACKSTAGE.run("platform/file_1");

    // run JSLint
    TREADMILL.jslint("services/storage_1", {maxlen: 80});

    ex = false;
    try {
      db.open();
    } catch(e) {
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
      ex = true;
    }
    assert(ex, "Bad input 'undefined' to db.open() should raise an exception.");

    ex = false;
    try {
      db.open(21);
    } catch(e) {
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
      ex = true;
    }
    assert(ex, "Bad input '21' to db.open() should raise an exception.");

    ex = false;
    try {
      db.open("example.com");
    } catch(e) {
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
      ex = true;
    }
    assert(ex, "Bad input 'example.com' to db.open() should raise an exception.");

    assert(typeof db.open("test_db").execute === "function",
        "typeof db::execute() should be function not "+
        typeof db.open("test_db").execute);

    assert(typeof db.open("test_db").executeStep === "function",
        "typeof db::executeStep() should be function not "+
        typeof db.open("test_db").executeStep);

    // two simultanious connections
    var cxn_1 = db.open("test_db");
    var cxn_2 = db.open("test_db");

    ex = false;
    try {
      db.open("test_db").execute("this is bad SQL");
    } catch(e) {
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
      ex = true;
    }
    assert(ex, "Bad SQL passed to execute() should raise an exception.");

    ex = false;
    try {
      db.open("test_db").executeStep("this is bad SQL");
    } catch(e) {
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
      ex = true;
    }
    assert(ex, "Bad SQL passed to executeStep() should raise an exception.");

    db.open("test_db").execute(
        "CREATE TABLE IF NOT EXISTS testing (key VARCHAR(256), value VARCHAR(256), PRIMARY KEY (key))");

    // bindings parameter is optional
    db.open("test_db").executeStep("SELECT * FROM testing WHERE key='literal'");
    db.open("test_db").executeStep("SELECT * FROM testing WHERE key=:myKey");

    // bindings must be a dictionary object
    ex = false;
    try {
      db.open("test_db").executeStep("SELECT * FROM testing WHERE key=:myKey", [7]);
    } catch(e) {
      ex = true;
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
    }
    assert(ex, "bindings must be a dictionary object");

    ex = false;
    try {
      db.open("test_db").executeStep("SELECT * FROM testing WHERE key='literal'", {myParam: 7});
    } catch(e) {
      ex = true;
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
    }
    assert(ex, "SQL with no params should raise an exception.");

    // we can get away without assigning params (they default to null)
    assert(!db.open("test_db").executeStep("SELECT * FROM testing WHERE key=:first").hasMore(),
        "No results when no params are assigned.");

    cxn = db.open("test_db");
    cxn.execute("BEGIN EXCLUSIVE TRANSACTION");
    try {
      cxn.execute("INSERT INTO testing VALUES(:k, :v)", {k:1, v:"the"});
    } catch(e) {
      ex = true;
      BACKSTAGE.platform.console.log("Expected Exception: "+ e);
    }
    assert(ex, "Insert statement should have a conflict clause.");

    cxn.execute("INSERT OR REPLACE INTO testing VALUES(:k, :v)", {k:1, v:"the"});
    cxn.execute("INSERT OR REPLACE INTO testing VALUES(:k, :v)", {k:2, v:null});
    cxn.execute("INSERT OR REPLACE INTO testing VALUES(:k, :v)", {k:3, v:"7"});
    cxn.execute("INSERT OR REPLACE INTO testing VALUES(:k, :v)", {k:4, v:"Fireworks Project"});
    cxn.execute("COMMIT TRANSACTION");

    cxn.execute("INSERT OR REPLACE INTO testing VALUES(:k, :v)", {k:4, v:"Fireworks Project again"});

    results = cxn.executeStep("SELECT * FROM testing WHERE key=:k1 OR key=:k2", {k1:2, k2:4});
    ex = 0;
    while(results.hasMore()) {
      ex += 1;
      val = results.next().value;
      assert(val === (ex === 1 ? null : "Fireworks Project again"),
          "Value should be '"+
          (ex === 1 ? null : "Fireworks Project again") +"' ("+ val +")");
    }
    assert(ex, "There should have been some results.");
  };

  return pub;
}());
