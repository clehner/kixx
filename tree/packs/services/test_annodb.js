var TADB = {};

var NS = "annodb_testing";
var KEY = "annodb_testing_key";

function assert(condition, message) {
  if (!condition) {
    throw new Error("(assertion failed): "+ message);
  }
}

TADB.go = function go() {
  var TestSuite = BACKSTAGE.run("simpletest/testrunner_1").TestSuite,
      suite;

  suite = new TestSuite("AnnoDB", TREADMILL.testOutputFormatter(TREADMILL.appendOutput));

  suite.addTest("testing", function test_creation(test) {
        var anno = BACKSTAGE.run("services/annodb_1");
        test.is(typeof anno, "object", "anno should be an object.", typeof anno);
        test.is(typeof anno.set, "function", "anno.set should be an function.", typeof anno.set);
        test.is(typeof anno.get, "function", "anno.get should be an function.", typeof anno.set);
        test.finished();
      },
      "creation");

  suite.addTest("testing", function test_badParams(test) {
        var db = BACKSTAGE.run("services/annodb_1"), ex;

        ex = false;
        try {
          db.get(null, "key");
        } catch(e) {
          ex = true;
        }
        test.ok(ex, "db.get() error with null key");

        ex = false;
        try {
          db.get("key", 134);
        } catch(e) {
          ex = true;
        }
        test.ok(ex, "db.get() error with number namespace");

        ex = false;
        try {
          db.set(null, "key", "foo");
        } catch(e) {
          ex = true;
        }
        test.ok(ex, "db.set() error with null key");

        ex = false;
        try {
          db.set("key", "foo", 134);
        } catch(e) {
          ex = true;
        }
        test.ok(ex, "db.set() error with number namespace");

        test.finished();
      },
      "bad params");

  suite.addTest("testing", function test_functionsAsValues(test) {
        db = BACKSTAGE.run("services/annodb_1");
        // functions within the values passed to annodb.set() will not raise
        // an exception, but will be nullified
        var dumpObject = BACKSTAGE.run("services/debug_1").dumpObject;
        test.ok(db.set(KEY, {foo: function(){ return 99; }, bar:1}, NS),
          "set should callback true");
        test.is(db.get(KEY, NS), {bar:1}, "function returned as null");
        test.finished();
      },
      "functions as values");

  suite.addTest("testing", function test_getNA(test) {
        db.remove(KEY, NS);
        test.is(db.get(KEY, NS), null, "get() returns null for item that does not exist.");
        test.finished();
      },
      "get: not available");

  suite.run(function() {});

  TREADMILL.jslint("services/annodb_1");
}
