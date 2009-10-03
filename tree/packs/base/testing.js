this.simpletest = require("simpletest", "0.1");
this.base = require("base", "0.1");
this.eq = base.eq;

let testsuite = new simpletest.TestSuite("eq()",
    simpletest.DumpOutputFormatter);

function test_strings_equal(test)
{
  test.ok(eq("foo",'foo'), "single and double quoted strings are equal.");
  test.ok(eq("100",'100'), "single and double quoted strings are equal.");
  test.ok(eq(1+"ok", "1ok"), "concat strings are equal.");

  test.finished();
}

function test_strings_notequal(test)
{
  test.ok(!eq('foo','bar'), "foo != bar");
  test.ok(!eq(1+'string', 1+' string'), "1+'string' != 1+' string'");

  test.ok(!eq(2,'2'), "eq() is strong typed");

  test.finished();
}

function test_numbers_equal(test)
{
  test.ok(eq(12,12), "12 == 12");
  test.ok(eq(1.5, 3/2), "eq(1.5, 3/2)");

  test.finished();
}

function test_numbers_notequal(test)
{
  test.ok(!eq(12,13), "!eq(12,13)");
  test.ok(!eq(2.2,'2.1'), "!eq(2.2,'2.1')");
  test.ok(!eq(1.5, 4/2), "!eq(1.5, 4/2)");

  test.ok(!eq(2.2,'2.2'), "eq() is strong typed");

  test.finished();
}

// this is where eq() differs from ==
function test_objects_equal(test)
{
  test.ok(eq({}, {}), "eq({}, {})");
  test.ok(eq([], []), "eq([], [])");

  test.ok(eq({foo:'bar'}, {foo:'bar'}),
      "eq({foo:'bar'}, {foo:'bar'})");

  // out of order properties of an object
  test.ok(eq({foo:'bar', bar:'baz'}, {bar:'baz', foo:'bar'}),
      "eq({foo:'bar', bar:'baz'}, {bar:'baz', foo:'bar'})");

  test.ok(eq([1,null], [1,null]), "eq([1,null], [1,null]])");

  test.ok(
      eq([1,true,null,['a','b'],{foo:'bar'}],
        [1,true,null,['a','b'],{foo:'bar'}]),
      "eq(deep, deep)");

  test.finished();
}

function test_objects_notequal(test)
{

  test.ok(!eq(new Date(), new Date()), "eq(new Date(), new Date())");
  test.ok(!eq({foo:'bar'}, {bar:'foo'}), "eq({foo:'bar'}, {bar:'foo'})");
  test.ok(!eq([1,null], [null,1]), "eq([1,null], [null,1]])");

  test.ok(!eq([1,true,null,['a','b'],{foo:'bar'}],
        [1,true,null,['a','c'],{foo:'bar'}]),
      "eq(deep, deep) a");

  test.ok(!eq([1,true,null,['a','b'],{foo:'bar'}],
        [1,true,null,['a'],{foo:'bar'}]),
      "eq(deep, deep) b");

  test.ok(!eq([1,true,null,['a','b'],{foo:'bar'}],
        [1,true,null,['a','b'],{foo:'foo'}]),
      "eq(deep, deep) c");

  test.finished();
}

function test_functions_equal(test)
{
  function f() { return true; }

  let a = f;
  let b = f;

  test.ok(eq(a,f), "eq(a,f)");
  test.ok(eq(a,b), "eq(a,b)");

  test.finished();
}

function test_functions_notequal(test)
{
  function f() { return true; }
  function c() { return true; }

  let a = f;
  let b = c;

  test.ok(!eq(a,c), "eq(a,c)");
  test.ok(!eq(a,b), "eq(a,b)");
  test.ok(!eq(f,c), "eq(f,c)");

  test.finished();
}

function test_mixed(test)
{
  test.ok(eq(null, null), "eq(null, null)");
  test.ok(!eq(0, null), "!eq(0, null)");
  test.ok(!eq(null,{}), "!eq(null,{})");

  // this is contrary to JavaScript '=='
  test.ok(!eq(1,'1'), "eq(1,'1')");
  test.ok(!eq(0, false), "!eq(0, false)");
  test.ok(!eq(1, true), "!eq(1, true)");

  test.finished();
}

testsuite.addTest("Strings", test_strings_equal, "strings equal");
testsuite.addTest("Strings", test_strings_notequal, "strings not equal");
testsuite.addTest("Numbers", test_numbers_equal, "numbers equal");
testsuite.addTest("Numbers", test_numbers_notequal, "numbers not equal");
testsuite.addTest("Objects", test_objects_equal, "objects equal");
testsuite.addTest("Objects", test_objects_notequal, "objects not equal");
testsuite.addTest("Functions", test_functions_equal, "functions equal");
testsuite.addTest("Functions", test_functions_notequal, "functions not equal");
testsuite.addTest("Mixed", test_mixed, "mixed equality stuff");

testsuite.run(function(){});
