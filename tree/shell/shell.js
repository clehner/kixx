// imports
let gImputil = null;
let gFx = null; 

/**
 */
var CmdLine = {};
CmdLine.input = null;
CmdLine.output = null;

CmdLine.init = function CmdLine_init()
{
  this.input = document.getElementById("input");
  this.output = document.getElementById("output");

  this.input.onkeydown = this.onkey;
  this.reset();
};

CmdLine.onkey = function CmdLine_onkey(e)
{
  if(e.shiftKey && e.keyCode == 13) { // shift-enter
    Utils.setTextareaRows(CmdLine.input, 1);
    return true;
  }
  if(e.keyCode == 13) { // enter
    // execute the input on enter
    try {
      CmdLine.ex();
    } catch(err) {
      alert(err);
    }
    CmdLine.reset();
    return true;
  }
  if(e.ctrlKey && e.keyCode == 38) { // up
    var val = CmdHist.getLast();
    if(!val) return true;
    CmdLine.reset(val);
    return true;
  }
  if(e.ctrlKey && e.keyCode == 40) { // down
    CmdLine.reset(CmdHist.getNext() || "");
    return true;
  }
  // todo: implement tab complete - we're going to do a module for this
  return true;
};

CmdLine.reset = function CmdLine_reset(val)
{
  val = val || "";
  window.setTimeout(function(e) {
      CmdLine.input.value = val;
      Utils.setTextareaRows(CmdLine.input, val);
      CmdLine.input.focus();
    }, 1);
};

CmdLine.printInput = function CmdLine_printInput(s)
{
  this.println(s, "input");
};

CmdLine.printStdout = function CmdLine_printStdout(s)
{
  if(typeof s == "undefined")
    return;

  this.println(s.toString(), "output");
};

// todo: use debug module to pretty print errors
CmdLine.printError = function CmdLine_printError(e)
{
  this.println(e.toString(), "error");
};

CmdLine.println = function CmdLine_println(ln, type)
{
  var ta = document.createElement("textarea");
  ta.value = ln;
  ta.className = "outbox" + " "+ type;
  this.output.appendChild(ta);
  Utils.setTextareaRows(ta, ln);
};

CmdLine.ex = function CmdLind_ex()
{
  var cmd = this.input.value;
  this.input.value = "";
  CmdHist.append(cmd);
  this.reset();
  this.printInput(cmd); 

  try {
    var rv = gImputil.execute(cmd, Shell);
    this.printStdout(rv);
  } catch(e) {
    this.printError(e);
  }
};

/**
 */
var CmdHist = {};

CmdHist.pointer = 0;
CmdHist.list = [];

CmdHist.getLast = function CmdHist_getLast()
{
  if(this.pointer == 0) return false; 
  return this.list[this.pointer -= 1];
}

CmdHist.getNext = function CmdHist_getNext()
{
  if(this.pointer == this.list.length) return false;
  return this.list[this.pointer += 1];
}

CmdHist.append = function CmdHist_append(cmd)
{
  this.list.push(cmd);
  this.pointer = this.list.length;
}

/**
 */
var Shell = null;

/**
 */
var Utils = {};

Utils.setTextareaRows = function Utils_setTextareaRows(textarea, input)
{
  input = input ? input.toString() : "";

  if(input == 1) {
    textarea.rows += 1;
    return;
  }
  textarea.rows = input.split(/\n/).length;
};

Utils.run = function Utils_run(path, context)
{
  let parts = path.split("/");

  let file = gFx.file.open(parts[0]);

  for(let i = 1; i < parts.length; i++)
    file.append(parts[i]);

  gImputil.load(file, context);
};

function onWinLoad(e)
{
  gImputil = require("imputil", "0.1");
  Shell = gImputil.getBackstagePass();
  Shell.run = Utils.run;
  gFx = require("firefox", "0.1");
  CmdLine.init();
}

window.addEventListener("load", onWinLoad, false);