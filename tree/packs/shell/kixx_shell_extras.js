window.addEventListener("moduleLoaderReady",
    function () {
      var utils = BACKSTAGE.run("shell/utils");

      window.removeEventListener("moduleLoaderReady", arguments.callee, false);

      shellCommands.require = utils.require;
      shellCommands.dumpObject = utils.dumpObject;

      document.getElementById("output").getElementsByTagName("div")[0].
      appendChild(document.createTextNode(", require(), dumpObject(), "));
    }, false);
