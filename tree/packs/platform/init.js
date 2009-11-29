/**
 * @fileOverview Init routine to bootstrap the Kixx platform
 */

// main function (run from backstage)
function main() {
  require("./windows_1").getCurrent(
    function loadToolbarButton(win) {
      require("./utils_1").installToolbarButton(win);
    });

  require("services/log_1").info("Kixx platform loaded.");
}

if (require.main === module.id) {
  main();
}
