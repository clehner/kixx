var TM_TESTING = {};

function assert(condition, message) {
  if (!condition) {
    throw new Error("(assertion failed): "+ message);
  }
}

TM_TESTING.go = function go() {
  var suite,
      div = document.getElementById("treadmill");

  // output a JSLint scan that fatally stops
  TREADMILL.jslint("treadmill/test/jslint-fatal.js");

  assert(div.childNodes.length === 1,
      "div.childNodes.length === 1 ("+
      div.childNodes.length +")");
  assert(div.firstChild.getAttribute("class") === "block-failed",
      "div.firstChild.class === 'block-failed' ("+
      div.firstChild.getAttribute("class") +")");

  // output a JSLint scan that passes
  TREADMILL.jslint("treadmill/treadmill.js");

  assert(div.childNodes.length === 2,
      "div.childNodes.length === 2 ("+
      div.childNodes.length +")");
  assert(div.lastChild.getAttribute("class") === "block-passed",
      "div.lastChild.class === 'block-passed' ("+
      div.lastChild.getAttribute("class") +")");

  // utility to check only the failed test results are output
  function checkTestPoints(e, num) {
    var checked = false;
    for (i = 0; i < e.length; i += 1) {
      if (e[i].tagName === "UL") {
        checked = true;
        assert(e[i].childNodes.length === num,
            "testList.childNodes.length ("+ num +" !== "+
             e[i].childNodes.length +")");
      }
    }
    assert((num ? (checked === true) : (checked === false)),
        "did not find a <ul> list of failed test points.");
  }

  function testAllPass() {
    assert(div.lastChild.getAttribute("class") === "block-passed",
        "div.lastChild.class === 'block-failed' ("+
        div.lastChild.getAttribute("class") +")");

    checkTestPoints(div.lastChild.childNodes, 4);
  }

  function testError() {
    assert(div.lastChild.getAttribute("class") === "block-failed",
        "div.lastChild.class === 'block-failed' ("+
        div.lastChild.getAttribute("class") +")");

    // check formatting
    assert(div.lastChild.lastChild.tagName === "PRE",
         div.lastChild.lastChild.tagName +" !== pre");

    TREADMILL.createTestSuite("Treadmill: test all pass, todo, skip", [
        {
          test: function allPassTodoSkip(test) {
            test.ok(true, "passes");
            test.todo("testing todo block", 2);
            test.ok(false, "first todo", "need to do");
            test.is(0, 0, "second todo", "need to do");
            test.ok(true, "done", "this is done");
            test.skip("testing skips", 2);
            test.ok(true, "first skip", "we are skipping");
            test.is(1, 0, "second skip", "we are skipping");
            test.is(1, 1, "second pass");
            test.finished();
          }
        }
      ]).run(testAllPass);
  }

  function testTimeout() {
    assert(div.lastChild.getAttribute("class") === "block-failed",
        "div.lastChild.class === 'block-failed' ("+
        div.lastChild.getAttribute("class") +")");

    checkTestPoints(div.lastChild.childNodes, 0);

    // check formatting
    assert(div.lastChild.lastChild.nodeValue === "timed out",
         div.lastChild.lastChild.nodeValue +" !== timed out");

    // create a test suite with a timeout
    TREADMILL.createTestSuite("Treadmill: test error", [
        {
          test: function test_error(test) {
            test.ok(false, "first fail", "reason");
            test.ok(true, "passes");
            throw new Error("Test Error");
            test.is(false, null, "second fail", "reason");
            test.is(1, 1, "second pass");
            test.finished();
          }
        }
      ]).run(testError);
  }

  function testPassed() {
    assert(div.childNodes.length === 3,
        "div.childNodes.length === 3 ("+
        div.childNodes.length +")");
    assert(div.lastChild.getAttribute("class") === "block-failed",
        "div.lastChild.class === 'block-failed' ("+
        div.lastChild.getAttribute("class") +")");

    checkTestPoints(div.lastChild.childNodes, 2);

    // create a test suite with a timeout
    TREADMILL.createTestSuite("Treadmill: test timeout", [
        {
          test: function timeout(test) {
            test.ok(true, "passes");
            test.is(1, 1, "second pass");
          }
        }
      ]).run(testTimeout);
  }

  // create a failing test suite
  TREADMILL.createTestSuite("Treadmill: tests fail", [
      {
        test: function someFail(test) {
          test.ok(false, "first fail", "reason");
          test.ok(true, "passes");
          test.is(false, null, "second fail", "reason");
          test.is(1, 1, "second pass");
          test.finished();
        }
      },{
        test: function allPass(test) {
          test.ok(true, "passes");
          test.is(1, 1, "second pass");
          test.finished();
        }
      }
    ]).run(testPassed);
}
