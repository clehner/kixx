function DumpObject() {
  var COUNT = 0;

  function probeObject(a, aLimit, aSkip, aIndent) {
    var str, i, p;

    if (typeof(a) == "string") {
      return "{string} '"+ a +"'";
    }
    if (typeof(a) == "number") {
      return "{number} "+ a;
    }
    if (typeof(a) == "boolean") {
      return "{boolean} "+ a;
    }
    if (a == null) {
      return "{null}";
    }
    if (typeof(a) == "undefined") {
      return "{undefined}";
    }
    if (typeof(a) == "function") {
      return "{function} "+ a.name ;
    }

    if (typeof(a) == "object") {
      if (a.length && a.pop && a.push) {
        str = "{array} --\n";
        for (i = 0; i < a.length; i++) {
          if(COUNT < aLimit) {
            COUNT += 1;
            str += aIndent +"["+i+"] = "+ probeObject(
                a[i], aLimit, aSkip, aIndent +"  ") +"\n";
          }
          else {
            str += aIndent +"["+i+"] = TOO MUCH RECURSION\n";
          }
        }
        return str;
      }

      str = "{object} --\n";
      for (p in a) {
        if(COUNT > aLimit) {
          str += aIndent +"["+p+"] = TOO MUCH RECURSION\n";
        } else if (aSkip && aSkip.test(p)) {
          str += aIndent +"["+p+"] = SKIPPED\n";
        } else {
          COUNT += 1;
          str += aIndent +"["+p+"] = "+ probeObject(
              a[p], aLimit, aSkip, aIndent +"  ") +"\n";
        }
      }
      return str;
    }
    return aIndent +"{unknown}\n";
  }

  function dumpObject(obj, limit, regex) {
    if (arguments.length === 2 && typeof(limit) === "object") {
      regex = limit;
      limit = null;
    }
    limit = limit || 96;
    regex = regex || null;
    COUNT = 0;

    return probeObject(obj, limit, regex, "  ", 0);
  }

  return dumpObject;
}

exports.dumpObject = DumpObject();

exports.props = function props(a) {
  var p, rv = "";
  for (p in a) {
    if (a.hasOwnProperty(p)) {
      rv += (p +" : "+ (typeof a[p] === "function" ? "{function}" : a[p]) +"\n");
    }
  }
  return rv;
};

exports.stack = function debug_stack(caller)
{
  var stackText = "Stack Trace: \n";

  if(typeof caller != "function")
    return stackText;

  var count = 0;
  while(caller)
  {
    stackText += count++ + ":" + caller.name + "(";

    if(!caller.arguments)
    {
      stackText += ")\n";
      break;
    }

    for(var i = 0; i < caller.arguments.length; ++i)
    {
      var arg = caller.arguments[i];
      stackText += arg;
      if (i < caller.arguments.length - 1)
        stackText += ",";
    }
    stackText += ")\n";
    caller = caller.arguments.callee.caller;
  }
  return stackText;
};

exports.assert = function assert(aCondition, aMessage)
{
  if(aCondition) return true;

  var stack = exports.stack(assert);
  throw new AssertionError(aMessage +"\n"+ stack);
}

function AssertionError(aMessage)
{
  this.message = aMessage;
}
AssertionError.prototype = new Error;
AssertionError.prototype.name = "AssertionError";

exports.AssertionError = AssertionError;
