var gFile = require("os", "0.1").file;
var settings = require("settings", "0.1");

var SETTINGS = "KIXX_PACKS";
var SYS_DIRS = {'boot':1};

function init()
{
  var unpacked = genUnpackedList();
  var reg = settings.fetch(SETTINGS);

  var toInstall = [];

  for(var i = 0; i < reg.length; i++)
  {
    var pack = reg[i];

    // pack has never been installed
    if(!(pack.name in unpacked))
      toInstall.push({name:pack.name, url:pack.url});
  }

  minstall(toInstall);
  // todo: we need to clean up removed packs from settings
}

function minstall(list)
{
  if(!list.length) return;
  var pack = list.shift();
  install(pack.name, pack.url, function() { minstall(list); });
}

function install(name, url, aCallback)
{
  var dwn = require("net", "0.1").downloader;
  dwn.simplefetch(url, targetFor(name), function(a) {},
      function(pack) {
        // todo: handle toolpack download exceptions
        unpack(pack);
        updateSettings(name, url);
      });
}

function unpack(pack)
{
  // todo: handle toolpack unpack exceptions
  var target = gFile.open("Kixx");
  target.append(pack.leafName);

  require("zipfile", "0.1").extractall(pack, target);
  pack.remove(true);
}

function genUnpackedList()
{
  let rv = {};
  var li = gFile.contents(gFile.open("Kixx"));
  for(let i = 0; i < li.length; i++)
  {
    var file = li[i]
    if(file.isFile()) continue;
    if(file.leafName in SYS_DIRS) continue;

    rv[file.leafName] = 1;
  }

  return rv;
}

function targetFor(name) {
  return gFile("Profile").append(name);
}

function updateSettings(name, url) {
  var s = settings.fetch(SETTINGS);
  s[name] = url;
  settings.save(SETTINGS, s);
}
