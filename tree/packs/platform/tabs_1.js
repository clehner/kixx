/**
 * @fileOverview
 */

// todo: #notCrossPlatform
// We need to determine what platform we are on before
// defining these functions

/**
 * @constructor
 */
function constructTab(aTab) {
  var pub = {};
  
  /**
   * The ID of the tab. Tab IDs are unique within a browser session.
   */
  pub.id;

  /**
   * The zero-based index of the tab within its window.
   */
  pub.index;

  /**
   * The ID of the window the tab is contained within.
   */
  pub.windowId;

  /**
   * Whether the tab is selected.
   */
  pub.selected;

  /**
   * The URL the tab is displaying.
   */
  pub.url;

  /**
   * The title of the tab. This may not be available if the tab is loading.
   */
  pub.title;

  /**
   * The URL of the tab's favicon. This may not be available if the tab is loading.
   */
  pub.faviconUrl;

  /**
   * Either "loading" or "complete". 
   */
  pub.status;

  return pub;
}

/**
 * @param {object} aProperties The desired properties of the newly created tab.
 *
 * @param {integer} [aProperties.windowId=current window]
 *    The window to create the new tab in. Defaults to the current window.
 *
 * @param {integer} [aProperties.index]
 *    The position the tab should take in the window. The provided value will be
 *    clamped to between zero and the number of tabs in the window.
 *
 * @param {string} [aProperties.url]
 *    The URL to navigate the tab to initially. Fully-qualified URLs must include
 *    a scheme (i.e. 'http://www.google.com', not 'www.google.com'). Relative
 *    URLs will be relative to the current page within the extension. Defaults to
 *    the New Tab Page or about:blank.
 *
 * @param {boolean} [aProperties.selected=true]
 *    Whether the tab should become the selected tab in the window. Defaults to
 *    true.
 *
 * @param {function} [aCallback]
 *    If you specify the callback parameter,
 *    it should specify a function that looks like this: 
 *    <code>function({Tab} tab) {...});</code>
 *    Where tab is a {@link Tab} object.
 */
exports.create = function tabs_create(aProperties, aCallback) {
  // todo: a lot of the api documented above is not implemented here.
  var browser, tab;

  if (!aProperties || typeof aProperties !== "object") {
  }
  
  aProperties.url = aProperties.url || "about:blank";
  aProperties.selected = ((aProperties.selected === false) ? false : true);

  browser = require("platform/firefox/utils_1").
    getMostRecentChromeWindow().gBrowser;
  tab = browser.addTab(aProperties.url);

  if (aProperties.selected) {
    browser.selectedTab = tab;
  }

  if (typeof aCallback === "function") {
    aCallback(constructTab(tab));
  }
};
