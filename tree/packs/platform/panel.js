function onWindowLoad(e)
{
  var scr = document.createElement("script");
  document.getElementById("document-head").appendChild(scr);
  // todo: this url should be dynamically created by detecting the
  // platform we are running on
  scr.src = "chrome://kixx/content/modules.js";

  // give some time for the require.js script to load
  window.setTimeout(registerPanel, 20);
}

function registerPanel()
{
  var launcher = require("platform/launcher_1");
  var reg = launcher.registry();
  // we are expecting only clean data from the launcher registry
  for(var i in reg) {
    appendLauncher(reg[i].icon, reg[i].handler);
    dump(reg[i].icon +"\n"+ reg[i].handler +"\n");
  }
}

function appendLauncher(img, handler)
{
  var icon = createIcon(img, handler);
  document.getElementById("panel").appendChild(icon);
}

function createIcon(img, handler)
{
  var el = document.createElement("img");
  el.setAttribute("src", img);
  el.setAttribute("class", "launcher-icon");
  el.addEventListener("click", handler, false);
  return el;
}

window.addEventListener("load", onWindowLoad, false);
