/**
 * @fileOverview
 */

/*jslint
onevar: true,
evil: true,
undef: true,
nomen: true,
eqeqeq: true,
plusplus: true,
strict: true,
immed: true
*/

/*global
Components: false,
exports: true,
require: false,
module: false,
sys: false
*/

"use strict";

// todo: #notCrossPlatform
// We need to determine what platform we are on before
// defining these functions

function constructFileHandle(nsIFile, aPath) {
  var f;

  function F() {}
  F.prototype = nsIFile;
  f = new F();
  f.location = aPath;
  return f;
}

function openLocation(nsIFile, aLoc) {
  var list, i;

  list = aLoc.split("/");
  for (i = 0; i < list.length; i += 1) {
    nsIFile.append(list[i]);
  }

  return nsIFile;
}

/**
 * Creates and returns a file object.
 * @param {string} aLoc Currently only "Profile" and "Kixx" are supported
 * @returns {object} A File object
 */
exports.open = function file_open(aLoc) {
  var mozId = require("platform/firefox/utils_1").MOZID;

  if (typeof aLoc !== "string") {
    throw new Error(
        "Unexpected aLoc argument passed to platform/file::open(): '"+ aLoc +
        "'.  Called by "+ file_open.caller.name +"().");
  }

  switch(aLoc) {
    case "Profile":
      return constructFileHandle(
               Components.classes["@mozilla.org/file/directory_service;1"].
               getService(Components.interfaces.nsIProperties).
               get("ProfD", Components.interfaces.nsIFile), aLoc);
    case "Kixx":
      return constructFileHandle(
               Components.classes["@mozilla.org/extensions/manager;1"].
               getService(Components.interfaces.nsIExtensionManager).
               getInstallLocation(mozId).
               getItemLocation(mozId), aLoc);
    default:
      return constructFileHandle(openLocation(file_open("Kixx"), aLoc), aLoc);
  }
};

/**
 * Creates the file on disk if it did not exist before.
 * @param {object} aFile A file object created by {@link open}().
 * @returns {object} The file object passed in.
 */
exports.create = function file_create(aFile) {
  aFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 666);
  return aFile;
};

// todo: there should be a max bytes parameter for this
/**
 * Read the text contents of a file. (uses the UTF-8 encoding)
 * @param {object} aFile A File object returned by {@link open}().
 * @returns {string} The contents of the file.
 */
exports.read = function file_read(aFile) {
  var str = "", data = {},
      fs = Components.classes["@mozilla.org/network/file-input-stream;1"].
              createInstance(Components.interfaces.nsIFileInputStream),
      cs = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
              createInstance(Components.interfaces.nsIConverterInputStream);

  fs.init(aFile, -1, 0, 0);
  cs.init(fs, "UTF-8", 0, 0); // you can use another encoding here if you wish

  while(cs.readString(4096, data) !== 0) {
    str += data.value;
  }
  cs.close(); // this close fs too

  return str;
};

/**
 * Write text to a file. (using the UTF-8 encoding)
 * @param {object} aFile A file object created by {@link open}().
 * @param {string} aContent The text to write to the file.
 * @param {boolean} [aAppend=false]
 *   If true the file is appended rather than overwritten.
 *   Defaults to false.
 * @returns {object} The file object passed in.
 */
exports.write = function file_write(aFile, aContent, aAppend) {
  // todo: catch bad params
  var fs = Components.classes["@mozilla.org/network/file-output-stream;1"].
             createInstance(Components.interfaces.nsIFileOutputStream),
      cs = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
             createInstance(Components.interfaces.nsIConverterOutputStream);

  if(aAppend) {
    // flags: read and write, create, append
    fs.init(aFile, 0x02 | 0x08 | 0x10, 666, 0); 
  }

  else {
    // flags: read and write, create, truncate 
    fs.init(aFile, 0x02 | 0x08 | 0x20, 666, 0); 
  }

  cs.init(fs, "UTF-8", 0, 0);
  cs.writeString(aContent);
  cs.close(); // this close fs too

  return aFile;
};

/**
 * Returns the contents of a folder as a list of file objects.
 * @param {object} aFile A file object created by {@link open}().
 *   This file object must point to a directory and not a file.
 * @returns {array} The contents of the folder as a list of file objects.
 */
exports.contents = function file_contents(aFile) {
  var list = [], file, entries;

  if (!aFile.exists) {
    throw new Error(module.id+"::contents(): Passed directory "+ aFile.path +
        " does not exist. Called by "+ file_contents.caller.name +
        "() in process "+ require.main);
  }

  if (!aFile.isDirectory()) {
    throw new Error(module.id+"::contents(): Passed directory "+ aFile.path +
        " is not a directory. Called by "+ file_contents.caller.name +
        "() in process "+ require.main);
  }

  // we need this assignment to prevent infinite recursion
  entries = aFile.directoryEntries;

  try {
    while(entries.hasMoreElements()) {
      file = entries.getNext();
      file.QueryInterface(Components.interfaces.nsIFile);
      list.push(file);
    }
  } catch(e) {
    throw new Error(module.id+"::contents(): Got unexpected error '"+ e +
        "'. Called by "+ file_contents.caller.name +
        "() in process "+ require.main);
  }

  // todo: how cool would it be to return an iterator instead???
  return list;
};
