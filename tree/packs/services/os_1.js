// todo: this needs to do a check to see what platform we are on
// before requiring the platform utils
var platformUtils = require("platform/utils_1");

exports.file = {
  open: platformUtils.file.open,
  read: platformUtils.file.read,
  write: platformUtils.file.write,
  contents: platformUtils.file.contents
};
