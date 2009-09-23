function onWindowLoad(e)
{
  var scr = document.createElement("script");
  document.getElementById("document-head").appendChild(scr);
  // todo: this url should be dynamically created by detecting the
  // platform we are running on
  scr.src = "chrome://kixx/content/require.js";

  // give some time for the require.js script to load
  window.setTimeout(registerPanel, 20);
}

function registerPanel()
{
  var platform = require("platform", "0.1");
  var reg = platform.launcher.registry();
  // we are expecting only clean data from the launcher registry
  for(let i in reg)
    appendLauncher(reg[i].icon, reg[i].handler);
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
