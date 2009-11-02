this.simpletest = require("simpletest/testrunner_1");

var testsuite = new simpletest.TestSuite(
    "JavaScript", simpletest.ConsoleOutputFormatter);

function test_Numbers(test)
{
  test.is(
      ( 2 + 2 ), 4,
      "numbers are 64 bit floating point");

  test.is(
      1.5, ( 3 / 2 ),
      "numbers can be floats or integers");

  test.ok(12.0 === 12, "12.0 === 12");
  test.ok(0.1 === 0.10, "0.1 === 0.10");

  test.is(
      3.5e3, 3500,
      "large numbers can be represented with exponential notation");

  test.finished();
}

function test_Equality(test)
{
  test.ok(1 == 1, "1 == 1");
  test.ok(1 != 2, "1 != 2");
  test.ok(10 === 10, "1 === 1");
  test.ok(12.0 === 12, "12.0 === 12");
  test.ok(0.1 === 0.10, "12.0 === 12");

  // weak types
  test.ok(1 == '1', "1 == '1'");
  test.ok(1 !== '1', "1 !== '1'");
  test.ok(null != 'null', "null == 'null'");
  test.ok(true != 'true', "true == 'true'");

  test.ok(null === null, "null === null");
  test.ok(null != false, "null == false");
  test.ok(!!(null) == false, "(null) == false");
  test.ok(0 == false, "0 == false");
  test.ok(1 == true, "1 == true");
  test.ok(0 !== false, "0 != false");
  test.ok(0 !== null, "0 != null");

  test.ok({} != {}, "{} != {}");
  test.ok([] != [], "[] != []");

  var a = {foo:'bar'};
  var b = {foo:'bear'};

  test.ok(a != b, "a != b");
  test.ok(b === b, "b === b");

  var c = {foo:'bar'};
  test.ok(a != c, "a != c");

  var x = [1, 2, a];
  var y = [1, 2, c];
  test.ok(x != y, "x != y");

  test.finished();
}

testsuite.addTest("Numbers", test_Numbers, "How are numbers represented in JavaScript?");
testsuite.addTest("Comparisons", test_Equality, "How does equality work?");

exports.run = function javascript_tests_run() {
  testsuite.run(function(){});
};
