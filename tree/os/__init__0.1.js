// todo: this needs to do a check to see what platform we are on
// before requiring the platform utils
var platformUtils = require("firefox", "0.1");

var file = {
  open: platformUtils.file.open,
  read: platformUtils.file.read,
  write: platformUtils.file.write,
  contents: platformUtils.file.contents
};
