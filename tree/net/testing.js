var simpletest = require("simpletest", "0.1");
var file = require("os", "0.1").file;
var download = require("download", "0.1");

let testsuite = new simpletest.TestSuite(
    "Download", simpletest.DumpOutputFormatter);

function test_simplefetch_urlDoesNotExist(test)
{
  let targ = file.open("Profile");
  targ.append("test_download");

  download.simplefetch(
      "http://www.doesnotexist.us/fireworks.zip",
      targ,
      function onProgress(a) {
        test.is(a, -1, "result is -1 for bad requests");
      },
      function onComplete() {
        test.finished();
      });
}

function test_simplefetch_html(test)
{
  let targ = file.open("Profile");
  targ.append("test_download");

  download.simplefetch(
      "http://www.google.com",
      targ,
      function onProgress(a) {
        // the result is an integer 1 - 100 repr the percentage downloaded
        test.ok(0 < a <= 100, "result number");
      },
      function onComplete() {
        test.ok(targ.fileSize > 999, "the file actually has contents");
        test.finished();
      });
}

let fixture = {
  setup: function() {},

  teardown: function() {
    let targ = file.open("Profile");
    targ.append("test_download");
    targ.remove(true);
  }
};

testsuite.addTest("simplefetch", test_simplefetch_urlDoesNotExist,
    "try to download url that does not exist", null, 3000);
testsuite.addTest("simplefetch", test_simplefetch_html,
    "download an html file", fixture, 5000);

testsuite.run(function(){});
