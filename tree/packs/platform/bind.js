// used to bind the platform source modules to
// the exposed target platform modules.
exports.bind = function bind(source, target) {
  // we assume that target is an object
  var n;

  source = ((!source || typeof source !== "object") ? {}: source);

  for (n in source) {
    if (source.hasOwnProperty(n)) {
      exports[n] = target[n];
    }
  }
};
