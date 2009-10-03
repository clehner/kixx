var gFile = require("services/os_1").file;
var mem = require("services/memcache_1");

var PREFS = "kixx-settings.json";
var MEMKEY = "KIXX-SETTINGS";
var NS = "kixx@fireworksproject.com";

/**
 */
exports.fetch = function fetch(key)
{
  // todo: we need parameter checking here
  var settings = getSettings();
  return settings[key] || null;
}

/**
 */
exports.save = function save(key, value)
{
  // todo: we need parameter checking here
  var settings = getSettings();
  settings[key] = value;

  // todo: we need exception handling here
  var file = loc()[1];
  gFile.write(file, JSON.stringify(settings));
  mem.set(MEMKEY, settings, 0, NS);
}

function load()
{
  var l = loc();

  // todo: better handling of this exception??? logging???
  if(!l || !l[1].exists() || !l[1].isFile()) {
    throw new Error("config.load() could not find "+ PREFS);
  }

  var dir = l[0];
  var file = l[1];

  if(dir == "Kixx")
    install(file);

  // todo: we need a platform agnostic JSON
  var content = JSON.parse(gFile.read(file));
  // todo: we need exception handling for a corrupted file.

  require("services/memcache_1")
    .set(MEMKEY, content, 0, "kixx@fireworksproject.com");
}

/**
 */
function loc()
{
  function find(type)
  {
    var file = gFile.open(type);
    var li = gFile.contents(file);
    for(var i = 0; i < li.length; i++)
      if(li[i].leafName == PREFS) return li[i];

    return null;
  }

  // must search the profile dir first
  var rv = find("Profile");
  if(rv) return ["Profile", rv];
  var rv = find("Kixx");
  if(rv) return ["Kixx", rv];

  return null;
}

function install(file) {
  file.copyTo(gFile.open("Profile"), "");
}

function getSettings() {
  var s = mem.get(MEMKEY, NS);
  if(!s) {
    load();
    s = {};
  }
  return s;
}
