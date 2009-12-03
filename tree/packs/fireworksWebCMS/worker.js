/**
 */

var LOC = "http://localhost:8080";

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

// [aItem.id]
// aItem.content
// aItem.description
exports.postContent = function postContent(aItem, aCallback) {
  var body = JSON.stringify(aItem);

  makeRequest("inventory/", "POST",
      function (stat, text) {
        if (stat !== 200) {
          sys.print(text, "invalid status code for inventory/ ("+ stat +")");
        }
        aCallback(stat);
      }, body);
};

exports.putPage = function putPage(aName, aConfigs, aCallback) {
  makeRequest("pages/"+ aName, "PUT",
      function (stat, text) {
        if (stat === 200 || stat === 201) {
          aCallback(stat);
          return;
        }
        sys.print(text, "invalid status code for pages/"+ aName +" ("+ stat +")");
        aCallback(0);
      }, aConfigs);
};

exports.getConfigsHTML = (function () {
    var html = "";

    function getConfigsHTML(aCallback, aReload) {
      if (aReload) {
        html = "";
      }

      if (html) {
        aCallback(html);
        return;
      }

      makeRequest("configs", "GET",
          function (stat, text) {
            var configs, p;
            html = '<ol id="page-list">';

            if (stat !== 200) {
              sys.print(text, "invalid status code for configs ("+ stat +")");
              return;
            }
            try {
              configs = JSON.parse(text);
            } catch(err) {
              sys.print(text, "Could not parse JSON data for configs");
              return;
            }
            
            for (p in configs) {
              if (configs.hasOwnProperty(p)) {
                html += ('<li><b>'+ p +' ::</b> '+ configs[p][1] +'<br />current page: '+
                  '<a href="pages.html?page='+ configs[p][0] +'">'+ configs[p][0] +'</a></li>');
              }
            }

            html += '</ol>';
            aCallback(html);
          });
    }
    return getConfigsHTML;
}());

exports.getTemplatesHTML = (function () {
    var html = "";

    function getTemplatesHTML(aCallback, aReload) {
      if (aReload) {
        html = "";
      }

      if (html) {
        aCallback(html);
        return;
      }

      makeRequest("templates/", "GET",
          function (stat, text) {
            var templates, i;
            if (stat !== 200) {
              sys.print(text, "invalid status code for templates/ ("+ stat +")");
              return;
            }
            try {
              templates = JSON.parse(text);
            } catch(err) {
              sys.print(text, "Could not parse JSON data for templates/");
              return;
            }
            
            for (i = 0; i < templates.length; i++) {
              html += ('<div><h4>'+ templates[i].name +'</h4><textarea class="template">'+
                templates[i].content +'</textarea></div>');
            }

            aCallback(html);
          });
    }
    return getTemplatesHTML;
}());

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
            sys.print(text, "Could not parse JSON data for content inventory");
            return;
          }

          for (i = 0; i < inv.length; i += 1) {
            html += ('<div class="content-item" key="'+ inv[i].id +'"><h4>'+
              (inv[i].description || 'no decription') +'</h4><textarea>'+
              inv[i].content[inv[i].content.length -1] +'</textarea></div>');
          }
          aCallback(html);
        });
    }
    return getContentHTML;
}());

if (module.id === require.main) {
  sys.print("Fireworks Website CMS loaded.");
}
