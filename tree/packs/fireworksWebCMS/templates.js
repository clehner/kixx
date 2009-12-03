/**
 */

function populateList(aReload) {
  CMS.getTemplatesHTML(
      function (list) {
        document.getElementById("templates-ctn").innerHTML = list;
      }, aReload);
}

function start() {
  populateList(false);
}
