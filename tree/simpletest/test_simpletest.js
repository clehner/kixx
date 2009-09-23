this.simpletest = require("simpletest", "0.1");

let testsuite = new simpletest.TestSuite(
    "simpletest", simpletest.DumpOutputFormatter);

function test_passing_ok(test)
{
  test.ok(1, "1 evaluates to true");
  test.ok(true, "true evalutes to true", "this should not fail");

  test.finished();
}

function test_passing_is(test)
{
  test.is(1, 1, "1 == 1");
  test.is('1', "1", "string 1 == string 1");
  test.is(null, null, "null == null");
  test.is("foo", "foo", "string == string");

  test.is(
      [1,true,null,['a','b'],{foo:'bar'}],
      [1,true,null,['a','b'],{foo:'bar'}],
      "deep == deep");

  test.finished();
}

function test_passing_isnt(test)
{
  test.isnt(2, '3', "2 != string 3");
  test.isnt(null, false, "null != false");
  test.isnt(false, true, "false != true");

  test.isnt("foo", "bar", "string != string");
  test.isnt([1,null,['a','b'],{foo:'bar'}],
      [1,true,null,['a','b'],{foo:'bar'}],
      "deep != deep");

  test.finished();
}

testsuite.addTest("Passing", test_passing_ok, "passing ok()");
testsuite.addTest("Passing", test_passing_is, "passing is()");
testsuite.addTest("Passing", test_passing_isnt, "passing isnt()");

testsuite.run(function(){});
