/**
 * @fileOverview
 */

// todo: #notCrossPlatform
// We need to determine what platform we are on before
// defining these functions

/**
 * Creates and returns a file object.
 * @param {string} aLoc Currently only "Profile" and "Kixx" are supported
 * @returns {object} A File object
 */
exports.open = function file_open(aLoc) {
  var loc,
      mozId = require("platform/firefox/utils_1").MOZID;

  switch(aLoc) {
    case "Profile":
      loc = "ProfD";
      break;

    case "Kixx":
      return Components.classes["@mozilla.org/extensions/manager;1"].
               getService(Components.interfaces.nsIExtensionManager).
               getInstallLocation(exports.mozId).
               getItemLocation(exports.mozId);

    default:
      // todo: use the debug module to handle errors
      throw new Error("platform.file.open(): "+
          "invalid location alias; "+ aLoc);
  }

  return Components.classes["@mozilla.org/file/directory_service;1"].
           getService(Components.interfaces.nsIProperties).
           get(loc, Components.interfaces.nsIFile);
};

/**
 * Creates the file on disk if it did not exist before.
 * @param {object} aFile A file object created by {@link open}().
 * @returns {object} The file object passed in.
 */
exports.create = function file_create(aFile) {
  aFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
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
    fs.init(aFile, 0x02 | 0x08 | 0x10, 0666, 0); 
  }

  else {
    // flags: read and write, create, truncate 
    fs.init(aFile, 0x02 | 0x08 | 0x20, 0666, 0); 
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
  var list = [], file;

  while(aFile.directoryEntries.hasMoreElements())
  {
    file = aFile.directoryEntries.getNext();
    file.QueryInterface(Components.interfaces.nsIFile);
    list.push(file);
  }

  // todo: how cool would it be to return an iterator instead???
  return list;
};