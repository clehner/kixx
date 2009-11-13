/*jslint
onevar: true,
undef: true,
nomen: true,
eqeqeq: true,
plusplus: true,
bitwise: true,
strict: true,
immed: true
*/

/*global Components: false, JSLINT: false, document: false*/

"use strict";

// the the module loading tool into this script
var require = (function getRequire() {
  // todo: this functionality should be moved into a firefox specific module.
  return Components.classes["@mozilla.org/appshell/appShellService;1"].
      getService(Components.interfaces.nsIAppShellService).
      hiddenDOMWindow.document.documentElement.
      ownerDocument.getElementById("backstage").contentWindow.modules.getLoader();
}());

var TREADMILL = {};

TREADMILL.appendOutput = (function createAppendOutput() {
  var that = function appendOutput(level, html) {
    var div = document.createElement("div");
    if (level === "failed") {
      div.setAttribute("class", "block-failed");
    } else if(level === "passed") {
      div.setAttribute("class", "block-passed");
    }
    document.getElementById("treadmill").appendChild(div);
    div.innerHTML = html;
  };

  that.passed = function failed(html) {
    that("passed", html);
  };

  that.failed = function passed(html) {
    that("failed", html);
  };

  return that;
}());

TREADMILL.testOutputFormatter =
function createTestOutputFormatter(stdout) {
  // public methods
  return {

    /**
     * Called when a test suite begins to run.
     * @param {string} name The name of the suite.
     */
    startSuite: function startSuite(name) {
    },

    /**
     * Called when a test suite is finished.
     * @param {object} result
     */
    endSuite: function endSuite(results) {
      var passed = true, report;

      function arrayMap(f, l) {
        var i, str = "";
        for (i = 0; i < l.length; i += 1) {
          str += f(l[i]);
        }
        return str;
      }

      function dictMap(f, d) {
        var p, str = "";
        for (p in d) {
          if (d.hasOwnProperty(p)) {
            str += f(p, d[p]);
          }
        }
        return str;
      }

      function points(point) {
        if (point.result !== "ok" || point.directive) {
          return '<li>'+
            point.num +' '+
            point.result +': '+
            point.description +' '+
            point.directive +' '+ point.reason +
            (point.result === "ok" ? '' : '<br /># '+ point.diagnostic) +
            '</li>';
        }
        return '';
      }

      function tests(test) {
        var str = '<h5>'+ test.description +'</h5>',
            testpoints;

        if (test.result === "not_ok") { // something in the test failed
          passed = false;
          return (str += 'failed test points:<ul>'+ arrayMap(points, test.points) +'</ul>');
        }
        if (test.result === "timed_out") {
          passed = false;
          return (str += 'timed out');
        }
        if (test.result === "error") {
          passed = false;
          return (str += '<pre>name: '+ test.error.name +
              "\nmessage: "+ test.error.message +
              "\nfile: "+ test.error.fileName +
              "\nline: "+ test.error.lineNumber +'</pre>');
        }
        testpoints = arrayMap(points, test.points);
        if (testpoints) {
          return (str += 'directed test points:<ul>'+ testpoints +'</ul>');
        }
        return (str += 'passed');
      }

      function cases(casename, cas) {
        return '<h4>Testcase: '+ casename +'</h4>'+ arrayMap(tests, cas.tests);
      }

      report = dictMap(cases, results.cases);
      if (passed) {
        stdout.passed(report);
      } else {
        stdout.failed(report);
      }
    },

    /**
     * Called when a test case grouping is about to start.
     * @param {string} name The name of the test case.
     */
    startCase: function startCase(name) {
    },

    /**
     * Called when all the tests in a test case have run.
     * @param {object} result
     */
    endCase: function endCase(result) {
      //dump("** End Test Case *********************************************\n");
    },

    /**
     * Called just before a test function is run.
     * @param {string} desc The description of the test function.
     */
    startTest: function startTest(desc) {
    },

    /**
     * Called when a test function has finished.
     * @param {object} result
     */
    endTest: function endTest(result) {
    },

    /**
     * Called whenever a test point function is run.
     * @param {object} result
     */
    testpoint: function testpoint(result) {
    }
  };
};

TREADMILL.jslint = function jslint(aFile) {
  var url, result;

  if (typeof JSLINT !== "function") {
    throw new Error("chrome://kixx/content/packs/jslint/fulljslint.js "+
        "must be included with a script tag for JSLint to work. ");
  }

  url = require.loader.normalize(require.loader.resolve(aFile.slice(0, -3)));
  result = JSLINT(require.loader.fetch(url));
  TREADMILL.appendOutput(
      (result ? "passed" : "failed"), JSLINT.report(false));
};

/**
 * @param {string} name The name of the test group 
 * @param {array} tests A list of objects with members
 *  - {function} test The test function (will be passed the test object)
 *  - {integer} time The time limit for the test before it times out
 */
TREADMILL.createTestSuite = function createTestSuite(name, tests) {
  var simpletest = require("simpletest/testrunner_1"),
      suite, i;
  suite = new simpletest.TestSuite(
      "Simpletest", TREADMILL.testOutputFormatter(TREADMILL.appendOutput));
  for(i = 0; i < tests.length; i += 1) {
    tests[i].time = tests[i].time || 500;
    suite.addTest(name, tests[i].test, tests[i].test.name, null, tests[i].time);
  }
  return suite;
};
