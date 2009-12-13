var fileUtils = require("platform/file_1");

var file = fileUtils.open("Kixx");
file.append("packs");
file.append("platform");
file.append("testing");
file.append("mutated_import.js");

fileUtils.write(file, "exports.myNumber = 11;");
var imported = require("platform/testing/mutated_import");
exports.val_1 = imported.myNumber;

fileUtils.write(file, "exports.myNumber = 12;");
require.loader.reload(require.loader.resolve("platform/testing/mutated_import"));
imported = require("platform/testing/mutated_import");
exports.val_2 = imported.myNumber;
