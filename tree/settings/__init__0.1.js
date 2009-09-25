var gFile = require("os", "0.1").file;

var PREFS = "kixx-settings.json";
var MEMKEY = "KIXX-SETTINGS";

/**
 */
function fetch()
{
  return require("memcache", "0.1")
    .get(MEMKEY, "kixx@fireworksproject.com");
}

/**
 */
function save(aValue)
{
  // todo: we need exception handling here
  gFile.write(JSON.stringify(aValue));

  require("memcache", "0.1")
    .set(MEMKEY, aValue, 0, "kixx@fireworksproject.com");
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

  require("memcache", "0.1")
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
    for(let i = 0; i < li.length; i++)
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
