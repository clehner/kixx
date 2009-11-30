/**
 * @fileOverview
 */

function EXECUTE(text, context, shell) {
  with (shell) {
    return context.eval(text);
  }
}

window.addEventListener("moduleLoaderReady",
    function () {
      var utils = BACKSTAGE.run("shell/utils"),
          this_input = document.getElementById("input"),
          this_output = document.getElementById("output"),
          this_historyList = [],
          this_historyPointer = 0,
          this_window = window;

      function printLine(ln, type) {
        var ta = document.createElement("textarea");
        ta.value = (typeof ln === "undefined" ? "undefined" : (ln +""));
        ta.className = "outbox" + " "+ type;
        this_output.appendChild(ta);
        setTextareaRows(ta, ln);
      }

      function printStdout(s) {
        printLine(s, "output");
      }

      function printInput(s) {
        printLine(s, "input");
      }

      function printError(e) {
        utils.console.err(e);
        printLine(e, "error");
      }

      function setTextareaRows(textarea, input) {
        input = input ? input.toString() : "";

        if(input == 1) {
          textarea.rows += 1;
          return;
        }
        textarea.rows = input.split(/\n/).length;
      }

      function reset(val) {
        val = val || "";
        window.setTimeout(function(e) {
            this_input.value = val;
            setTextareaRows(this_input, val);
            this_input.focus();
          }, 1);
      }

      function appendHistory(cmd) {
        this_historyList.push(cmd);
        this_historyPointer = this_historyList.length;
      }

      function getLastHistory() {
        if (this_historyPointer === 0) {
          return false; 
        }
        return this_historyList[this_historyPointer -= 1];
      }

      function getNextHistory() {
        if(this_historyPointer === this_historyList.length) {
          return false;
        }
        return this_historyList[this_historyPointer += 1];
      }

      function execute() {
        var rv,
            cmd = this_input.value,
            shell = {
              require: utils.require,
              getWindows: function getWindows() {
                var wins = utils.getWindows();
                for (var p in wins) {
                  dump(p+"\n");
                }
              },
              dumpObject: utils.dumpObject,
              props: utils.props,
              pr: function print(s) {
                return s;
              }
            };
        this_input.value = "";

        appendHistory(cmd);
        reset();
        printInput(cmd); 

        try {
          rv = EXECUTE(cmd, this_window, shell);
          printStdout(rv);
        } catch(e) {
          printError(e);
        }
      }

      this_input.onkeydown = function onkey(e) {
        if(e.shiftKey && e.keyCode == 13) { // shift-enter
          setTextareaRows(this_input, 1);
          return true;
        }
        if(e.keyCode == 13) { // enter
          // execute the input on enter
          try {
            execute();
          } catch(err) {
            alert(err);
          }
          reset();
          return true;
        }
        if(e.ctrlKey && e.keyCode == 38) { // up
          var val = getLastHistory();
          if(!val) {
            return true;
          }
          reset(val);
          return true;
        }
        if(e.ctrlKey && e.keyCode == 40) { // down
          reset(getNextHistory() || "");
          return true;
        }
        // todo: implement tab complete - we're going to do a module for this
      };

      // get started
      reset();
    }, false);
