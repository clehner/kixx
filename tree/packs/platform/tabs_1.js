var utils = require("./utils_1");

/**
 *
 *  windowId
 *    The window to create the new tab in. Defaults to the current window.
 *
 *  index
 *    The position the tab should take in the window. The provided value will be
 *    clamped to between zero and the number of tabs in the window.
 *
 *  url
 *    The URL to navigate the tab to initially. Fully-qualified URLs must include
 *    a scheme (i.e. 'http://www.google.com', not 'www.google.com'). Relative
 *    URLs will be relative to the current page within the extension. Defaults to
 *    the New Tab Page.
 *
 *  selected
 *    Whether the tab should become the selected tab in the window. Defaults to
 *    true
 */
// todo: make this follow the api, and return a tab object to the callback
exports.create = function tabs_create(aCreateProperties, aCallback)
{
  aCallback = aCallback || function(){};
  utils.openNewTab(aCreateProperties, aCallback);
};
