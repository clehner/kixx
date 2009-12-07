/**
 */

var DATA;

function populateList() {
  CMS.content(function (data) {
        var html = '<ul>', i;
        DATA = data;

        for (i = 0; i < DATA.length; i += 1) {
          html += ('<li><h4>id#'+ DATA[i].id +': '+ DATA[i].description +'</h4>'+
            '<div class="content">'+
            DATA[i].content[(DATA[i].content.length -1)] +'</div>'+
            '<span class="clickable" onclick="editItem('+ i +', this)">'+
            'edit</span></li>');
        }

        html += '</ul>';
        document.getElementById("inventory-ctn").innerHTML = html;
      });
}

function editItem(aIndex, aNode) {
  aNode.parentNode.setAttribute("class", "form");
  aNode.parentNode.innerHTML = ('<h4>id#'+ DATA[aIndex].id +'</h4>'+
    '<p>description: <br />'+
    '<input type="text" size="50" value="'+ DATA[aIndex].description +'" />'+
    '</p><p>content: <br /><textarea class="content-input">'+
    DATA[aIndex].content[(DATA[aIndex].content.length -1)] +'</textarea></p>'+
    '<p><button onclick="postContent('+ DATA[aIndex].id +
    ', this.parentNode.parentNode)">post</button></p>');
}

function postItem(aItem) {
  CMS.postContent(aItem,
      function (stat) {
        if(!stat) {
          alert("failed");
        } else {
          populateList();
        }
      });
}

function postContent(aID, aNode) {
  postItem({
    id: aID,
    description: aNode.childNodes[1].lastChild.value,
    content: aNode.childNodes[2].lastChild.value
  });
}

function postNewContent() {
  var desc = document.getElementById("post-description"),
      cont = document.getElementById("post-content");
  postItem({
    id: null,
    description: desc.value,
    content: cont.value
  });
  desc.value = "";
  cont.value = "";
}

function start() {
  populateList();
}
