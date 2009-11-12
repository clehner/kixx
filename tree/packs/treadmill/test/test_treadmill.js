var TM_TESTING = {};

function assert(condition, message) {
  if (!condition) {
    throw new Error("(assertion failed): "+ message);
  }
}

TM_TESTING.go = function go() {
  var div = document.getElementById("treadmill");
  // output a js lint scan that fatally stops
  TREADMILL.jslint("treadmill/test/jslint-fatal.js");
  assert(div.childNodes.length === 1,
      "div.childNodes.length === 1 ("+
      div.childNodes.length +")");
  assert(div.firstChild.class === "block-failed",
      "div.firstChild.class === 'block-failed' ("+
      div.firstChild.class +")");
}
