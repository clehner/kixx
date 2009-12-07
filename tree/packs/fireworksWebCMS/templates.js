/**
 */
function start() {
  CMS.templates(
      function (data) {
        var i, html = "";

        for (i = 0; i < data.length; i += 1) {
          html += ('<div><h4>'+ data[i].name +
            '</h4><textarea class="template">'+
            data[i].content +'</textarea></div>');
        }

        document.getElementById("templates-ctn").innerHTML = html;
      });
}
