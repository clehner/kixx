this.base = require("base/base_1");
this.eq = base.eq;

/**
 * @constructor
 * @param {String} name The name of the test suite
 * @param {Object} out An output formatter object
 */
function TestSuite(name, out)
{
  if(typeof name != "string") {
    throw new Error(
        "TestSuite constructor requires a string name to be passed.");
  }
  if(typeof out != "object") {
    throw new Error(
        "TestSuite constructor requires an output buffer object to be passed.");
  }

  /** a name for this test suite */
  this.name = name;

  /** a dictionary of lists holding tests per test case */
  this._cases = {};

  /**
   * the write out buffer, a formatter object like
   * DumpOutputFormatter
   */
  this._buffer = out;

  this.vocabulary = TestSimpleVocab;
}

/**
 * @param {String} testCase The name of the test case that this test function
 * should belong to
 * @param {Function} exec The test function itself
 * @param {String} desc A description of the test function
 * @param {Object} [fixture] A fixture object
 * @param {Number} [timeout] Specified tim limit for this test in miliseconds
 */
TestSuite.prototype.addTest =
function TestSuite_addTest(testCase, exec, desc, fixture, timeout)
{
  // set defaults
  timeout = timeout || 500;
  fixture = fixture || null;

  // validate the test case name 
  if(typeof testCase != "string") {
    throw new Error("TestSuite.addTest() requires a string as the "+
        "test case name.");
  }

  // validate the test function
  if(typeof exec != "function") {
    throw new Error("TestSuite.addTest() test function not found "+
      "for "+ testCase +"."+ exec);
  }

  // validate the test description 
  if(typeof desc != "string") {
    throw new Error("TestSuite.addTest() requires a string as the "+
        "test case desc.");
  }

  // validate the timeout
  if(typeof timeout != "number") {
    throw new Error("TestSuite.addTest() requires a number as the "+
        "timeout parameter.");
  }

  // validate the fixture
  if(fixture)
  {
    if(typeof fixture != "object"
      || typeof fixture.setup != "function"
      || typeof fixture.teardown != "function")
    {
      throw new Error("Invalid fixture passed to TestSuite.addTest()");
    }
  }

  var test = {
    exec: exec,
    description: desc,
    timeout: timeout,
    fixture: fixture
  };

  // add the test to the list in the test case dictionary
  if(!(testCase in this._cases))
    this._cases[testCase] = [];
  this._cases[testCase].push(test);
};

/**
 */
TestSuite.prototype.run =
function TestSuite_run(aCallback)
{
  if(typeof aCallback != "function") {
    throw new Error(
        "TestSuite.run() requires a callback function to be passed.");
  }

  var buffer = this._buffer;
  var cases = Iterator(this._cases);
  var vocab = this.vocabulary;

  // the mutable suite report object
  var suiteReport = {
    name: this.name,
    cases: {}
  };

  function runTest(test, report, callback)
  {
    test.complete = false;

    // currently running test state values
    var todo = 0;
    var skip = 0;
    var todoReason = "";
    var skipReason = "";
    var pointCount = 0;

    var timer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);

    var testHarness = {};

    // build the test harness that will be passed to each test function
    testHarness.finished = function testFinished()
    {
      if (test.complete) {
        return;
      }
      test.complete = true;

      // if this test already timed out, we do nothing.
      if(test.timedOut)
        return;

      // cancel the timer if it has not alredy timed out
      timer.cancel();

      finishTest(test, report, callback);
    }

    for(var name in vocab)
    {
      if(typeof vocab[name] != "function") {
        throw new Error("TestSuite.vocabulary must be an object "+
            "with factory functions as the only properties.");
      }

      if(typeof testHarness[name] != "undefined")
        throw new Error("TestSuite.vocabulary conflicting property '"+ name +"'");

      testHarness[name] = vocab[name](
          function testpoint(result)
          {
            if (test.complete) {
              return;
            }

            if(result.todo) {
              todo = result.num;
              todoReason = result.reason;
              return;
            }
            if(result.skip) {
              skip = result.num;
              skipReason = result.reason;
              return;
            }

            pointCount += 1;

            if(!todo && !skip && !result.passed)
              report.result = "not_ok";

            var directive = "";
            if(skip)
              directive = "SKIP";
            if(todo)
              directive = "TODO";

            var pointReport = {
              result: result.passed ? "ok" : "not_ok",
              num: pointCount,
              directive: directive,
              reason: todoReason || skipReason,
              description: result.description,
              diagnostic: result.diagnostic
            };

            report.points.push(pointReport);
            buffer.testpoint(pointReport);
            
            if(todo)
              todo -= 1;
            if(skip)
              skip -= 1;
          });
    }

    // start the timer to stop this test if it takes too long
    timer.initWithCallback({
        notify: function testTimedOut(t)
        {
          if(test.complete)
            return true;

          test.timedOut = true;
          finishTest(test, report, callback);
          return true;
        }},
        test.timeout,
        Components.interfaces.nsITimer.TYPE_ONE_SHOT
      );

    if(test.fixture) {
      try {
        test.fixture.setup();
      } catch(e) {
        report.result = "error_setup";
        report.error = e;
        finishTest(test, report, callback);
        return;
      }
    }

    try {
      test.exec(testHarness);
    }
    catch(e) {
      report.result = "error";
      report.error = e;
      finishTest(test, report, callback);
    }
  }

  function finishTest(test, report, callback)
  {
    test.complete = true;

    if(test.timedOut)
      report.result = "timed_out";

    if(test.fixture) {
      try {
        test.fixture.teardown();
      } catch(e) {
        report.result = "error_teardown";
        report.error = e;
      }
    }

    buffer.endTest(report);
    callback();
  }

  function runCase(testlist, report, callback)
  {
    if(!testlist.length) {
      // we're done with this case
      buffer.endCase(report);
      callback();
      return;
    }

    var test = testlist.shift();

    var testReport = {
        description: test.description,
        result: "ok",
        points: []
      };

    report.tests.push(testReport);

    // use a closure as a callback to avoid passing too many values around
    function runNextTest() {
      runCase(testlist, report, callback);
    }

    buffer.startTest(test.description);
    runTest(test, testReport, runNextTest);
  }

  function nextCase()
  {
    var testcase = null;

    try {
      testcase = cases.next();
    }
    catch(e if e instanceof StopIteration) {
      //kdump(arguments.callee.caller.arguments.callee.caller.name);
      buffer.endSuite(suiteReport);
      aCallback();
      return;
    }

    var caseReport = {
      name: testcase[0],
      tests: []
    };

    suiteReport.cases[testcase[0]] = caseReport;

    buffer.startCase(testcase[0]);
    runCase(testcase[1], caseReport, arguments.callee);
  }

  // start the testing
  buffer.startSuite(this.name);
  nextCase();
};

/**
 * @namespace
 */
var TestSimpleVocab = 
{
  ok: function TestSimpleVocab_ok(callback)
  {
    function ok(assertion, desc, diag)
    {
      desc = desc || "";
      diag = diag || "";

      var passed = assertion ? true : false;
      callback({
          passed: passed,
          description: desc,
          diagnostic: diag
        });
    }

    return ok;
  },

  is: function TestSimpleVocab_is(callback)
  {
    function is(a, b, desc, diag)
    {
      desc = desc || "";
      diag = diag || "";

      var passed = eq(a, b);
      var op = passed ? " is " : " is_not ";
      callback({
          passed: passed,
          description: desc,
          diagnostic: a + op + b +" "+ diag
        });
    }

    return is;
  },

  isnt: function TestSimpleVocab_isnt(callback)
  {
    function isnt(a, b, desc, diag)
    {
      desc = desc || "";
      diag = diag || "";

      var passed = !eq(a, b);
      var op = passed ? " is_not " : " is ";
      callback({
          passed: passed,
          description: desc,
          diagnostic: a + op + b +" "+ diag
        });
    }

    return isnt;
  },

  todo: function TestSimpleVocab_todo(callback)
  {
    function todo(why, howmany)
    {
      callback({
          todo: true,
          num: howmany,
          reason: why
        });
    }

    return todo;
  },

  skip: function TestSimpleVocab_skip(why, howmany)
  {
    function skip(why, howmany)
    {
      callback({
          skip: true,
          num: howmany,
          reason: why
        });
    }

    return skip;
  }
};

/**
 */
var DumpOutputFormatter =
{
  /**
   * Called when a test suite begins to run.
   * @param {string} name The name of the suite.
   */
  startSuite: function DOF_startSuite(name)
  {
    dump("\n === Test Suite: "+ name +" ===\n");
  },

  /**
   * Called when a test suite is finished.
   * @param {object} result
   */
  endSuite: function DOF_endSuite(result)
  {
    //kdump(repr(result));
    dump("\n === end Test Suite: "+ result.name +" ===\n");

    for(var name in result.cases)
    {
      var cas = result.cases[name];
      dump("\t-> test case: "+ name +"\n");

      var tests = result.cases[name].tests;
      var failures = [t for each(t in tests) if(t.result != "ok")];

      if(failures.length) {
        dump("\t    failures:");
        for(var i = 0; i < failures.length; i++) {
          dump("\n\t      "+
              failures[i].description +" "+ failures[i].result);
        }
        dump("\n\n");
      }
      else
        dump("\t    passed\n\n");
    }
  },

  /**
   * Called when a test case grouping is about to start.
   * @param {string} name The name of the test case.
   */
  startCase: function DOF_startCase(name)
  {
    dump("\n -- Test Case: "+ name +" --\n");
  },

  /**
   * Called when all the tests in a test case have run.
   * @param {object} result
   */
  endCase: function DOF_endCase(result)
  {
    //dump("** End Test Case *********************************************\n");
  },

  /**
   * Called just before a test function is run.
   * @param {string} desc The description of the test function.
   */
  startTest: function DOF_startTest(desc)
  {
    dump(" Testing: "+ desc +"\n");
  },

  /**
   * Called when a test function has finished.
   * @param {object} result
   */
  endTest: function DOF_endTest(result)
  {
    if(result.result == "error") 
    {
      dump("\n\n !Error: "+ result.error.name
          +" '"+ result.error.message
          +"'\n "+ result.error.fileName
          +"\n line:"+ result.error.lineNumber +"\n\n");
    }

    dump("-- End Test --------------------------------------------------\n\n");
  },

  /**
   * Called whenever a test point function is run.
   * @param {object} result
   */
  testpoint: function DOF_testpoint(result)
  {
    if(!result.directive && result.result == "ok")
      return;

    dump(" "+ result.result +" "+ result.num
        +" "+ result.directive +" "+ result.reason
        +" "+ result.description +"\n\t# "+ result.diagnostic +"\n");
  }
};

var ConsoleOutputFormatter =
{
  /**
   * Called when a test suite begins to run.
   * @param {string} name The name of the suite.
   */
  startSuite: function COF_startSuite(name)
  {
    sys.print(name, "=== Start Test Suite ");
  },

  /**
   * Called when a test suite is finished.
   * @param {object} result
   */
  endSuite: function COF_endSuite(result)
  {
    var i, p, report, casename, test, point, failed;
    report = "\n";

    for (casename in result.cases) {
      report += casename +"\n";
      for (i = 0; i < result.cases[casename].tests.length; i++) {
        test = result.cases[casename].tests[i];
        report += "  "+ test.description;
        if (test.result !== "ok") {
          report += " -> failed\n";
          for (p = 0; p < test.points.length; p ++) {
            point = test.points[p];
            if (point.result !== "ok") {
              report += "\t"+ point.num +": "+ point.description;
              report += " "+ point.directive +" "+ point.reason;
              report += "\n\t  # "+ point.diagnostic +"\n";
            }
          }
        } else {
          report += " -> passed\n";
        }
      }
    }

    sys.print(report, "test report");
    sys.print(result.name, "=== End Test Suite ");
  },

  /**
   * Called when a test case grouping is about to start.
   * @param {string} name The name of the test case.
   */
  startCase: function COF_startCase(name)
  {
    sys.print(name, "[Start Test Case]");
  },

  /**
   * Called when all the tests in a test case have run.
   * @param {object} result
   */
  endCase: function COF_endCase(result)
  {
    //dump("** End Test Case *********************************************\n");
  },

  /**
   * Called just before a test function is run.
   * @param {string} desc The description of the test function.
   */
  startTest: function COF_startTest(desc)
  {
    sys.print(desc, "[Start Test]");
  },

  /**
   * Called when a test function has finished.
   * @param {object} result
   */
  endTest: function COF_endTest(result)
  {
    if(result.result == "error") 
    {
      sys.print(result.error.name
          +" '"+ result.error.message
          +"'\n "+ result.error.fileName
          +"\n line:"+ result.error.lineNumber, "exception detected");
    }

    //sys.print(result.description, "[End Test]");
  },

  /**
   * Called whenever a test point function is run.
   * @param {object} result
   */
  testpoint: function COF_testpoint(result)
  {
    if(!result.directive && result.result == "ok")
      return;
    // we only care about failed test points
    sys.print(result.result +" "+ result.description
        +" "+ result.directive +" "+ result.reason
        +"\n\t# "+ result.diagnostic, result.num);
  }
};

exports.TestSuite = TestSuite;
exports.DumpOutputFormatter = DumpOutputFormatter;
exports.ConsoleOutputFormatter = ConsoleOutputFormatter;
