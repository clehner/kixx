var simpletest = require("simpletest", "0.1");
var db = require("annodb", "0.1");

var testsuite = new simpletest.TestSuite(
    "AnnoDB", simpletest.DumpOutputFormatter);

var NS = "annodb_testing";
var KEY = "annodb_testing_key";

function createSelect(cxn) {
  let s = cxn.createStatement("SELECT rowid FROM annotations "+
      "WHERE namespace=:ns AND namekey=:key");
  s.params.ns = NS;
  s.params.key = KEY;
  return s;
}

function createDelete(cxn, id) {
  let s = cxn.createStatement("DELETE FROM annotations "+
      "WHERE rowid=:id");
  s.params.id = id;
  return s;
}

function deleteTest(aCallback) {
  let cxn = db.getConnection();
  let stmt = createSelect(cxn);
  let result = [];
  stmt.executeAsync({
      handleError: function(e) {
        stmt.finalize();
        cxn.close();
        aCallback(false, e);
        return true;
      },
      handleResult: function(r) {
        while(true) {
          let row = r.getNextRow();
          if(row) result.push(row.getResultByName("rowid"));
          break;
        }
        return true;
      },
      handleCompletion: function(r) {
        stmt.finalize();

        if(r !=
          Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
        {
          cxn.close();
          let msg = "testing.deleteTest(): unexpected SQLite result";
          Components.utils.reportError(msg);
          aCallback(false, new Error(msg));
          return true;
        }

        for(let i = 0; i < result.length; i++) {
          let del = createDelete(cxn, result[i]);
          del.execute();
          del.finalize();
        }
        // delete from memcache too
        require('memcache', '0.1').del(KEY, NS);
        cxn.close();
        aCallback(true);

        return true;
      }
    });
}

function test_badparams(test)
{
  try {
    db.get(null, "key", function() {});
    test.ok(false, "db.get() with null key");
  } catch(e) {
    test.ok(true, "db.get() error with null key");
  }

  try {
    db.get("key", 134, function() {});
    test.ok(false, "db.get() with number namespace");
  } catch(e) {
    test.ok(true, "db.get() error with number namespace");
  }

  try {
    db.get("key", "134", undefined);
    test.ok(false, "db.get() with undefined callback");
  } catch(e) {
    test.ok(true, "db.get() error with undefined callback");
  }

  try {
    db.set(null, "key", "foo", function() {});
    test.ok(false, "db.set() with null key");
  } catch(e) {
    test.ok(true, "db.set() error with null key");
  }

  try {
    db.set("key", "foo", 134, function() {});
    test.ok(false, "db.set() with number namespace");
  } catch(e) {
    test.ok(true, "db.set() error with number namespace");
  }

  try {
    db.set("key", "foo", "134", undefined);
    test.ok(false, "db.set() with undefined callback");
  } catch(e) {
    test.ok(true, "db.set() error with undefined callback");
  }

  test.finished();
}

function test_functions_asvalues(test)
{
  // functions within the values passed to annodb.set() will not raise
  // an exception, but will be nullified
  db.set(KEY, {foo: function(){ return 99; }, bar:1}, NS,
      function(r) {
        test.ok(r, "set should callback true");
        db.get(KEY, NS, function(a, b)
          {
            test.ok((a === true), "error in get() call");

            test.is(b, {bar:1}, "function returned as null");

            test.finished();
          });
      });
}

function test_get_na(test)
{
  // we have to do the setup within the test because
  // fixtures do not support async execution
  deleteTest(function(yes, err)
    {
      if(!yes)
        throw err;

      let called = false;
      db.get(KEY, NS, function(a, b) {
          test.ok((called == false), "callback was already called");
          called = true;

          if(a === false) {
            test.ok(false, "get() resulted in an error");
            test.finished();
            return true;
          }

          test.is(b, null, "get() returns null for item that does not exist.");
          test.finished();
          return true;
        });
    });
}

function test_setandget(test)
{
  db.set();
}

testsuite.addTest("bad parameters", test_badparams,
    "get() and set() with bad params");

testsuite.addTest("function values", test_functions_asvalues,
    "get() and set() with functions as values", null, 1000);

testsuite.addTest("get() na", test_get_na,
    "get() when item does not exist");

testsuite.run(function(){});
