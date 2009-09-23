// todo: we need a way to resolve chrome URLs depending on
// the platform we're running on
function launch()
{
  require("platform", "0.1").tabs
    .create({url: "chrome://kixx/content/shell/shell.xhtml"});
}
