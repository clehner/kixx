/**
 */

function populateList(aReload) {
  CMS.getConfigsHTML(
      function (list) {
        document.getElementById("page-list-ctn").innerHTML = list;
      }, aReload);
}

function start() {
  populateList(false);
}
