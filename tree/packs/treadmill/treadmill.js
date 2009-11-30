/**
 * @fileOverview
 * <p>
 * The file
 * <code>treadmill/treadmill.js</code>
 * provides a few hooks to easily run JSLint
 * <a href="http://jslint.com/" target="_blank">(JSLint.com)</a>
 * and Simpletest on your toolpack.
 * </p><p>
 * To build an interactive test suite simply create an html document within
 * your toolpack that will run your tests.  The file
 * <code>treadmill/treadmill.js</code>
 * should be included in your testrunner html document with
 * <br /><code>&lt;script src="../treadmill/treadmill.js"...&gt;</code><br />
 * or
 * <br /><code>&lt;script
 * src="chrome://kixx/content/packs/treadmill/treadmill.js"...&gt;</code>
 * </p><p>
 * Your test runner html document must have a container
 * (<code>&lt;div&gt;</code>)
 * with the id attribute set to
 * <code>id="treadmill"</code>
 * where the results of the JSLint scans and Simpletest output will be
 * displayed.
 * </p><p>
 * <b>Important!:
 * <code>treadmill.js</code>
 * injects the
 * <code>require()</code>
 * function into the global namespace of the testrunner html document, enabling
 * use of the JavaScript module system within Kixx.
 * </b>
 */

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

/*global dump: false, window: true, Components: false, JSLINT: false, document: false*/

"use strict";

/**
 * <p>This script tries to intelligently insert the BACKSTAGE object into the
 * global namespace.  The BACKSTAGE object lives on the background page and is
 * not immediately available when the browser starts up. Normally this is not a
 * problem except in the case where the user has set the browser to open with a
 * page that depends on the availability of the BACKSTAGE object.
 * </p><p>
 * Therefore, this script first defines a BACKSTAGE.getModuleLoader() function
 * that throws an error when called.  When the Kixx platform and the current
 * window are both loaded the BACKSTAGE.getModuleLoader() function is redefined
 * and a special event is fired on the window called "moduleLoaderReady".
 * Content pages can be notified that the BACKSTAGE object is ready for use by
 * listening to the "moduleLoaderReady" DOM event to be fired on the window.
 * </p>
 */
var BACKSTAGE = null;

(function () {
  var loaderReady = false,
      thisLoaded = false,
      notified = false,
      
      bg = Components.classes["@mozilla.org/appshell/appShellService;1"].
                  getService(Components.interfaces.nsIAppShellService).
                  hiddenDOMWindow.document.getElementById("backstage").
                  contentWindow;

  function checkAndLoad() {
    if (notified) {
      return;
    }

    if ((loaderReady || bg.BACKSTAGE.run) && thisLoaded) {
      notified = true;
      BACKSTAGE = bg.BACKSTAGE;
      var ev = document.createEvent("Event");
      ev.initEvent("moduleLoaderReady", true, false);
      window.dispatchEvent(ev);
    }
  }

  function onModuleLoaderReady() {
    loaderReady = true;
    checkAndLoad();
  }

  // listen for the special "moduleLoaderReady" event from the background page
  bg.addEventListener("moduleLoaderReady", onModuleLoaderReady, false);

  window.addEventListener("unload",
      function treadmill_onUnload() {
        // prevent a leak when the window is reloaded
        bg.removeEventListener("moduleLoaderReady", onModuleLoaderReady, false);
      }, false);

  window.addEventListener("load",
      function (ev) {
        thisLoaded = true;
        checkAndLoad();
      }, false);
}());

/**
 * @namespace TREADMILL will be added to the global namespace.
 * @description The Treadmill application namespace.
 */
var TREADMILL = {};

/** @private */
TREADMILL.appendOutput = (function createAppendOutput() {
  /** @private */
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

  /** @private */
  that.passed = function failed(html) {
    that("passed", html);
  };

  /** @private */
  that.failed = function passed(html) {
    that("failed", html);
  };

  return that;
}());

/**
 * @field
 * @description The standard Treadmill output formatter.
 * Outputs Simpletest results to the test document.
 * @example
 * var TestSuite = require("simpletest/testrunner_1").TestSuite;
 * var suite = new TestSuite("My Tests", TREADMILL.testOutputFormatter);
 */
TREADMILL.testOutputFormatter =
function createTestOutputFormatter(stdout) {
  // public methods
  return {
    startSuite: function startSuite(name) {
    },
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
    startCase: function startCase(name) {
    },
    endCase: function endCase(result) {
    },
    startTest: function startTest(desc) {
    },
    endTest: function endTest(result) {
    },
    testpoint: function testpoint(result) {
    }
  };
};

/**
 * Scan a JavaScript file with JSLint.
 * <a href="http://jslint.com/" target="_blank">(JSLint.com)</a>
 * Will output the results as an html snippet onto your testrunner page.
 * Important!: To use this feature, you need to include
 * <code>
 * &lt;script src="chrome://kixx/content/packs/jslint/fulljslint.js"
 * &gt;&lt;/script&gt;
 * </code>
 *
 * @param {string} aFile The location of the file using the same annotation
 * as <code>require()</code>.
 */
TREADMILL.jslint = function jslint(aFile) {
  var loader = BACKSTAGE.getModuleLoader().loader;

  if (typeof JSLINT !== "function") {
    throw new Error("chrome://kixx/content/packs/jslint/fulljslint.js "+
        "must be included with a script tag for JSLint to work. ");
  }

  TREADMILL.appendOutput(
      (JSLINT(loader.fetch(loader.resolve(aFile))) ?
       "passed" : "failed"), JSLINT.report(false));
};

/**
 * Create a Simpletest test suite and run it. The output from the tests will be
 * written to the container element with id "treadmill" when the suite is done
 * running. This is just a convenience wrapper for the
 * <code>require("simpletest/testrunner_1").TestSuite</code>
 * constructor.
 *
 * @param {string} aName The name of the test group 
 * @param {object[]} aTests A list of objects with the following members:
 *  <br />{function} test The test function (will be passed the test
 *  object)
 *  <br />{integer} time The time limit for the test before it times out
 *  in milliseconds
 * @param {function} aCallback Will be called when the test suite is done running.
 */
TREADMILL.createAndRunTestSuite = function createTestSuite(aName, aTests, aCallback) {
  var simpletest = require("simpletest/testrunner_1"),
      suite, i;
  suite = new simpletest.TestSuite(
      "Simpletest", TREADMILL.testOutputFormatter(TREADMILL.appendOutput));
  for(i = 0; i < aTests.length; i += 1) {
    aTests[i].time = aTests[i].time || 500;
    suite.addTest(aName, aTests[i].test, aTests[i].test.name, null, aTests[i].time);
  }
  suite.run(aCallback);
};
