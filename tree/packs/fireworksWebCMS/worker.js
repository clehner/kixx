/**
 */

var LOC = "http://3.latest.fireworkscomputer.appspot.com";

var CACHE = {};

function makeRequest(aLoc, aMethod, aCallback, aBody) {
  var req = new XMLHttpRequest(),
      loc = LOC +"/content-manager/"+ aLoc;

  req.onload = function (ev) {
    aCallback(ev.target.status, ev.target.responseText);
  };

  req.onerror = function (ev) {
    aCallback(0, "");
  };

  req.open(aMethod, loc);
  req.send((aBody || null));
}

function updateData(aLocation, aData, aID) {
  var i;

  if (!CACHE.hasOwnProperty(aLocation)) {
    CACHE[aLocation] = [];
  }

  for (i = 0; i < CACHE[aLocation].length; i += 1) {
    if (CACHE[aLocation][i][aID] === aData[aID]) {
      CACHE[aLocation][i] = aData;
      return;
    }
  }

  CACHE[aLocation].push(aData);
}

// [aItem.id]
// aItem.content
// aItem.description
exports.postContent = function postContent(aItem, aCallback) {
  var body = JSON.stringify(aItem);

  makeRequest("inventory/", "POST",
      function (stat, text) {
        var item;
        if (stat !== 200) {
          sys.print(text, "invalid status code for POST to inventory/ ("+ stat +")");
        }
        item = JSON.parse(text);
        updateData("inventory/", item, "id");
        aCallback(stat);
      }, body);
};

exports.putPage = function putPage(aName, aConfigs, aCallback) {
  makeRequest("pages/"+ aName, "PUT",
      function (stat, text) {
        var page;
        if (stat === 200 || stat === 201) {
          page = JSON.parse(text);
          updateData("pages/", page, "uri");
          aCallback(stat);
          return;
        }
        sys.print(text, "invalid status code for pages/"+ aName +" ("+ stat +")");
        aCallback(0);
      }, aConfigs);
};

exports.putDefaults = function putDefaults(aBody, aCallback) {
  makeRequest("defaults", "PUT",
      function (stat, text) {
        if (stat === 200 || stat === 201) {
          CACHE["defaults"] = JSON.parse(text);
          aCallback(stat);
          return;
        }
        sys.print(text, "invalid status code for defaults ("+ stat +")");
        aCallback(0);
      }, aBody);
};

exports.getContentHTML = (function () {
    var html = "";

    function getContentHTML(aCallback, aReload) {
      if (aReload) {
        html = "";
      }

      if (html) {
        aCallback(html);
        return;
      }

      makeRequest("inventory/", "GET",
        function (stat, text) {
          var inv, i;

          if (stat !== 200) {
            sys.print(text,
              "invalid status code for content inventory ("+ stat +")");
            return;
          }
          try {
            inv = JSON.parse(text);
          } catch(err) {

          }

          for (i = 0; i < inv.length; i += 1) {
            html += ('<div class="content-item"><p>id: '+ inv[i].id +
              '</p><p>description: <input type="text" size="50" value="'+
              (inv[i].description || 'no decription')
              +'" /></p><p>content:<br /><textarea class="content-input">'+
              inv[i].content[inv[i].content.length -1] +'</textarea></div>');
          }
          aCallback(html);
        });
    }
    return getContentHTML;
}());

function fetch(aLocation, aCallback) {
  if (CACHE.hasOwnProperty(aLocation)) {
    aCallback(CACHE[aLocation]);
    return;
  }

  makeRequest(aLocation, "GET",
    function (stat, text) {
      var data;

      if (stat !== 200) {
        sys.print(text,
          "invalid status code for "+ aLocation +" ("+ stat +")");
        return;
      }
      try {
        data = JSON.parse(text);
      } catch(err) {
        sys.print(text, "Could not parse JSON data for "+ aLocation);
        return;
      }
      CACHE[aLocation] = data;
      aCallback(data);
    });
}

exports.templates = function templates(aCallback) {
  fetch("templates/", aCallback);
};

exports.content = function content(aCallback) {
  fetch("inventory/", aCallback);
};

exports.pages = function pages(aCallback) {
  fetch("pages/", aCallback);
};

exports.configs = function configs(aCallback) {
  fetch("configs", aCallback);
};

exports.defaults = function defaults(aCallback) {
  fetch("defaults", aCallback);
}

if (module.id === require.main) {
  sys.print("Fireworks Website CMS loaded.");
}
