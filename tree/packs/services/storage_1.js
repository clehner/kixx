/**
 * @fileOverview
 */

/*jslint
onevar: true,
evil: true,
undef: true,
nomen: true,
eqeqeq: true,
bitwise: true,
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

var LOG = require("services/log_1");

function constructResultSet(aStmt) {
  var pub = {}, pointer = aStmt.executeStep();

  pub.hasMore = function hasMore() {
    return pointer;
  };

  pub.next = function next() {
    var rv = aStmt.row;
    if (!pointer) {
      throw "End of result set.";
    }
    pointer = aStmt.executeStep();
    return rv;
  };

  pub.close = function close() {
    aStmt.reset();
    aStmt.finalize();
  };

  return pub;
}

function constructDatabaseHandler(aCxn) {
  var pub = {};

  function bindParameters(aStmt, aBindings, aSQL) {
    var i, msg;

    if (typeof aBindings !== "object" ||
         !aBindings.hasOwnProperty("length") ||
         aBindings.constructor.name !== "Array") {
      throw ("storage::db:executeStep() expects an Array passed as aBindings,"+
          " not '"+ typeof(aBindings) +"'.");
    }

    for (i = 0; i < aBindings.length; i += 1) {
      try {
        aStmt.bindStringParameter(i, aBindings[i]);
      } catch(e) {
        msg = ("Storage SQL error: no parameter "+ (i + 1) +" in '"+
               aSQL +"'. Called by "+ bindParameters.caller.caller.name +"()");
        LOG.warn(msg);
        throw msg;
      }
    }
    return aStmt;
  }

  function createStatement(aSQL) {
    var msg;

    try {
      return aCxn.createStatement(aSQL);
    } catch(createEx) {
      LOG.error(createEx);
      msg = ("Storage SQL error: "+ aCxn.lastErrorString +" in '"+
             aSQL +"'. Called by "+ createStatement.caller.caller.name +"()");
      LOG.warn(msg);
      throw msg;
    }
  }

  pub.execute = function execute(aSQL, aBindings) {
    var msg, s;
    if (!aBindings) {
      try {
        aCxn.executeSimpleSQL(aSQL);
      } catch(exSimple) {
        LOG.error(exSimple);
        msg = "Storage SQL error: "+ aCxn.lastErrorString +" in '"+
          aSQL +"'. Called by "+ execute.caller.name +"()";
        LOG.warn(msg);
        throw msg;
      }
      return;
    }

    s = bindParameters(createStatement(aSQL), aBindings, aSQL);
    try {
      s.execute();
    } catch(ex) {
      LOG.error(ex);
      msg = "Storage SQL error: "+ aCxn.lastErrorString +" in '"+
        aSQL +"'. Called by "+ execute.caller.name +"()";
      LOG.warn(msg);
      throw msg;
    }
  };

  pub.executeStep = function executeStep(aSQL, aBindings) {
    var s = createStatement(aSQL);
    if (aBindings) {
      s = bindParameters(s, aBindings, aSQL);
    }
    return constructResultSet(s);
  };

  return pub;
}

exports.open = function open(aLoc) {
  var fu = require("platform/file_1"), f;

  if (typeof aLoc !== "string" || /[\W]+/.test(aLoc)) {
    throw "File location parameter '"+ aLoc +
      "' passed to storage::open() contains invalid characters.";
  }

  try {
    f = fu.open("Profile");
    f.append("kixx_data");
    if (!f.exists()) {
      // 448 is the integer == 0700
      f.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 448);
    } else if (!f.isDirectory()) {
      f.remove(false);
      // 448 is the integer == 0700
      f.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 448);
    }
    f.append(aLoc +".sqlite");
    return constructDatabaseHandler(
        Components.classes["@mozilla.org/storage/service;1"].
        getService(Components.interfaces.mozIStorageService).openDatabase(f));
  } catch(ex) {
    LOG.error(ex);
    LOG.warn("Could not open kixx_data profile directory.");
    throw ("Could not open kixx_data profile directory. "+
          "Unexpected file system error. "+
          "Check the log for more details.");
  }
};
