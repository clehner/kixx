/**
 */

function populateList(aReload) {
  CMS.getContentHTML(
      function (list) {
        document.getElementById("inventory-ctn").innerHTML = list;
      }, aReload);
}

function postContent() {
  var item = {
    id: document.getElementById("post-id").value || null,
    description: document.getElementById("post-description").value,
    content: document.getElementById("post-content").value
  };

  CMS.postContent(item,
      function (stat) {
        if(!stat) {
          alert("failed");
        } else {
          alert("posted");
        }
      });
}

function start() {
  populateList(false);
}
