var gFile = require("services/os_1").file;
var settings = require("services/settings_1");

var SETTINGS = "KIXX_PACKS";

// todo: the PACKS_DIR name needs to come from sys configs
var PACKS_DIR = "packs";

exports.init = function init(aCallback)
{
  var unpacked = exports.getUnpackedList();
  var reg = settings.fetch(SETTINGS);

  // todo: pkgmgr.init() should reconcile the unpacked list with the settings
  if(!reg) {
    aCallback();
    return;
  }

  var toInstall = [];

  for(var i = 0; i < reg.length; i++)
  {
    var pack = reg[i];

    // pack has never been installed
    if(!(pack.name in unpacked))
      toInstall.push({name:pack.name, url:pack.url});
  }

  minstall(toInstall, aCallback);
  // todo: we need to clean up removed packs from settings
}

function minstall(list, aCallback)
{
  if(!list.length){
    aCallback();
    return;
  }
  var pack = list.shift();
  install(pack.name, pack.url, function() { minstall(list, aCallback); });
}

exports.install = function install(name, url, aCallback)
{
  var dwn = require("services/net_1").downloader;
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
  target.append(PACKS_DIR);
  target.append(pack.leafName);

  require("ziputil/zipfile_1").extractall(pack, target);
  pack.remove(true);
}

exports.getUnpackedList = function genUnpackedList()
{
  var rv = {};
  var dir = gFile.open("Kixx");
  dir.append(PACKS_DIR);
  var li = gFile.contents(dir);
  for(var i = 0; i < li.length; i++)
  {
    var file = li[i]
    if(file.isFile()) continue;

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
