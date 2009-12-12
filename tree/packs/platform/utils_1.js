// todo: #notCrossPlatform
// We need to determine what platform we are on before
// requireing the platform utils object.
var utils = require("platform/firefox/utils_1"),
    n;
for (n in utils) {
  if (utils.hasOwnProperty(n)) {
    exports[n] = utils[n];
  }
}
