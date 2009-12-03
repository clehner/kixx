function loadPage() {
}

function loadList() {
}

function putPage() {
  var name = document.getElementById("page-name").value,
      configs = document.getElementById("page-configs").value;

  if (!name) {
    alert("We need a name for this page.");
    return;
  }

  if (!configs) {
    alert("We need configs for this page.");
    return;
  }

  CMS.putPage(name, configs,
      function (result) {
        switch(result) {
        case 0:
          alert("failed");
          break;
        case 201:
          alert("created");
          break;
        case 200:
          alert("updated");
          break;
        }
      });
}

function start() {
  if (window.location.search) {
    loadPage();
  } else {
    loadList();
  }
}
