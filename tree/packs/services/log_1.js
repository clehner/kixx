// todo: this should be a setting
var LOG_TO_FILE = true;
var FILE = "kixx.log";

exports.logToFile = function log_logToFile(aBool)
{
  // todo: catch bad params
  LOG_TO_FILE = aBool;
}

exports.fatal = function log_fatal(a)
{
  sendout(70, "Fatal", a);
}

exports.error = function log_error(a)
{
  sendout(60, "Error", a);
}

exports.warn = function log_warn(a)
{
  sendout(50, "Warn", a);
}

exports.info = function log_info(a)
{
  sendout(40, "Info", a);
}

exports.config = function log_config(a)
{
  sendout(30, "Config", a);
}

exports.debug = function log_debug(a)
{
  sendout(20, "Debug", a);
}

exports.trace = function log_trace(a)
{
  sendout(10, "Trace", a);
}

function sendout(aLevel, aLevelDesc, aMessage)
{
  var msg = formatMessage(aLevelDesc, aMessage);
  if(aLevel < 60) {
    console.log(msg);
  }
  else
    console.err(msg);

  // todo: rotate log files
  if(LOG_TO_FILE)
  {
    var logfile = file.open("Profile");
    logfile.append(FILE);
    file.write(logfile, msg +"\n", true);
  }
}

function formatMessage(aLevelDesc, aMessage)
{
  var str = aMessage;
  if(typeof aMessage == "object")
    str = formatError(aMessage); // todo: detect objects that are not errors

  var d = new Date();

  var rv = d.toLocaleFormat("%Y-%m-%d %H:%M:%S")
    +"  "+ aLevelDesc +":  "+ str; 

  return rv;
}

function formatError(aE)
{
  var m, n, r, l, ln, fn = "";
  try {
    m  = aE.message;
    fn = aE.filename;
    l  = aE.location; 
    ln = l.lineNumber; 
  } catch (e) { }
  var rv = "\n-----======[ ERROR ]=====-----\n"+ 
             "  FileName:   "+fn+"\n"+
             "  Message:    "+m+"\n"+
             "  LineNumber: "+ln+"\n"+
             "------------------------------\n";
  return rv;
}

var console = require("platform/utils_1").console;
var file = require("platform/utils_1").file;
