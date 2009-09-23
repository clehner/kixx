var simpletest = require("simpletest", "0.1");
var mem = require("memcache", "0.1");

var testsuite = new simpletest.TestSuite(
    "Memcache", simpletest.DumpOutputFormatter);

var ns = "memcache_testing";
var key = "memcache_testing_key";

function test_all(test)
{
  test.is(mem.get(key, ns), null,
      "get() returns null if the item does not exist");

  test.is(mem.set(key, "foo", 0, ns), true,
      "set() returns true");

  test.is(mem.get(key, ns), "foo",
      "get() returns a value");

  test.is(mem.set(key, "bar", 0, ns), true,
      "set() overwrites a value");

  test.is(mem.get(key, ns), "bar",
      "get() returns an overwritten value");

  test.is(mem.add(key, 99, 0, ns), false,
      "add() fails if the key already exists");

  test.is(mem.get(key, ns), "bar",
      "get() returns the same value");

  test.is(mem.del(key, ns), undefined, "delete() the value to add it");

  test.is(mem.add(key, [1,2,3], 0, ns), true,
      "add() succeeds if the key does not exist");

  test.is(mem.get(key, ns), [1,2,3],
      "get() returns the added value");

  test.is(mem.del(key, ns), undefined, "delete() the value to replace it");

  test.is(mem.get(key, ns), null,
      "get() returns returns null after the item has been deleted");

  test.is(mem.replace(key, 1, 0, ns), false,
      "replace() fails if the item does not exist");

  test.is(mem.get(key, ns), null,
      "get() returns returns null when replace fails");

  test.is(mem.set(key, 1, 0, ns), true,
      "set() set 1");

  test.is(mem.replace(key, {foo: "bar"}, 0, ns), true,
      "replace() works when the key already exists");

  test.is(mem.get(key, ns), {foo: "bar"},
      "get() returns returns the replaced value");

  test.is(mem.del(key, ns), undefined, "delete() does not return a value");
  test.is(mem.get(key, ns), null, "test item has been deleted");

  // items with a different key on the same namespace
  test.is(mem.add("foo", 99, 0, ns), true,
      "add() an item with key 'foo'");
  test.is(mem.add("bar", 88, 0, ns), true,
      "add() an item with key 'bar'");
  test.is(mem.get("bar", ns), 88,
      "get() bar key");
  test.is(mem.get("foo", ns), 99,
      "get() foo key");

  // items with the same key on a different namespace
  test.is(mem.add("foo", [], 0, "foo"), true,
      "add() an item to namespace 'foo'");
  test.is(mem.add("foo", [{foo:true}], 0, "bar"), true,
      "add() an item to namespace 'bar'");
  test.is(mem.get("foo", "foo"), [],
      "get() foo foo");
  test.is(mem.get("foo", 'bar'), [{foo:true}],
      "get() foo bar");

  // in parallel
  require("memcache", "0.1").del("foo", 'bar');
  test.is(mem.get("foo", 'bar'), null,
      "get() after deleting in parallel");

  //var mem_one = require("memcache", "0.1");
  //var mem_two = require("memcache", "0.1");

  test.finished();
}

testsuite.addTest("all", test_all, "run memcache");

testsuite.run(function(){});
