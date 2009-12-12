var console = require('console');
var assert = require('test').assert;
var print = sys.print;
var instanceOf = function (instance, moduleId, typeName) {
    if (!require.isLoaded(moduleId))
        return false;
    return instance instanceof require(moduleId)[typeName];
};
var bar = {};
assert(!instanceOf(bar, 'a', 'Foo'), 'bar not instanceOf before load');
var a = require('a');
var foo = new a.Foo();
assert(!instanceOf(bar, 'a', 'Foo'), 'bar not instanceOf after load');
assert(instanceOf(foo, 'a', 'Foo'), 'foo instanceOf after load');
print('DONE', 'info');
