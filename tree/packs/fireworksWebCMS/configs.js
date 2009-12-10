/**
 */

var DATA = {
  configs: null,
  pages: null,
  defaults: null
};

function showPage(aName, aIndex, aNode) {
  var ta = document.createElement("textarea"),
      p = document.createElement("p"),
      b = document.createElement("button");

  ta.value = ((aIndex === null) ?
      "" : JSON.stringify(DATA.pages[aIndex].configs));
  ta.setAttribute("class", "configs");
  aNode.parentNode.replaceChild(ta, aNode);

  b.innerHTML = "put "+ aName;
  p.appendChild(b);
  ta.parentNode.appendChild(p);
  b.onclick = function() {
    CMS.putPage(aName, ta.value,
        function (stat) {
          if (!stat) {
            alert("Failed");
            return;
          }
          start();
        });
  }
}

function getConfiguredPage(aConfig, aPages) {
  var i;
  for (i = 0; i < aPages.length; i += 1) {
    if (aPages[i].name === aConfig[0]) {
      return {page: aPages[i], index: i};
    }
  }
  return null;
}

function populate(aConfigs, aPages, aDefaults) {
  var n, page, html = '<ol class="page-list">';

  for (n in aConfigs) {
    if (aConfigs.hasOwnProperty(n)) {
      page = getConfiguredPage(aConfigs[n], aPages);
      html += ('<li><b>'+ n +' ::</b> '+ aConfigs[n][1] +'<br />'+
          'current page id: '+ (page ? page.page.name : 'na') +'<br />'+
          '<span class="clickable" onclick="showPage('+"'"+ aConfigs[n][0] +
          "', "+ (page ? page.index : null) +', this)">edit</span></li>');
    }
  }

  html += '</ol>';
  document.getElementById("page-list-ctn").innerHTML = html;

  document.getElementById("defaults").value = JSON.stringify(aDefaults);
}

function putDefaults() {
  var text = (document.getElementById("defaults").value || "{}");
  try {
    JSON.parse(text);
  } catch (e) {
    alert("Invalid JSON: "+ text);
    return;
  }
  CMS.putDefaults(text,
      function (stat) {
        if (!stat) {
          alert("Failed");
          return;
        }
        alert("Updated");
      });
}

function start() {
  DATA = {
    configs: null,
    pages: null
  };

  function check() {
    if (DATA.configs && DATA.pages && DATA.defaults) {
      populate(DATA.configs, DATA.pages, DATA.defaults);
    }
  }

  CMS.pages(function (data) {
        DATA.pages = data;
        check();
      });
  CMS.configs(function (data) {
        DATA.configs = data;
        check();
      });
  CMS.defaults(function (data) {
        DATA.defaults = data;
        check();
      });
}
