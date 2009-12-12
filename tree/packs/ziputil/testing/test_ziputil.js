var simpletest = require("simpletest", "0.1");
var file = require("os", "0.1").file;
var zipfile = require("zipfile", "0.1");

let testsuite = new simpletest.TestSuite(
    "ZipReader", simpletest.DumpOutputFormatter);

function test_extractall_archDoesNotExist(test)
{
  let arch = file.open("Kixx");
  arch.append("zipfile");
  arch.append("testarch_doesntexist.zip");

  let target = file.open("Profile");
  target.append("test_zip_extraction");

  let ex = false;
  try {
    zipfile.extractall(arch, target);
  } catch(e) {
    ex = true;
  }
  test.ok(ex, "arch does not exist exception");

  test.finished();
}

function test_extractall_notZip(test)
{
  let arch = file.open("Kixx");
  arch.append("zipfile");
  arch.append("testarch_notzip.zip");

  let target = file.open("Profile");
  target.append("test_zip_extraction");

  let ex = false;
  try {
    zipfile.extractall(arch, target);
  } catch(e) {
    ex = true;
  }
  test.ok(ex, "arch is corrupted exception");

  test.finished();
}

let fixture = {
  setup: function () {},

  teardown: function()
  {
    let target = file.open("Profile");
    target.append("test_zip_extraction");
    target.remove(true);
  }
};

function test_extractall(test)
{
  let arch = file.open("Kixx");
  arch.append("zipfile");
  arch.append("testarch.zip");

  let target = file.open("Profile");
  target.append("test_zip_extraction");
  zipfile.extractall(arch, target);

  tnext = target.clone();

  target.append("root.txt");
  test.is(target.fileSize, 38, "the root.txt file exists");

  tnext.append("cattwo");
  test.ok(tnext.isDirectory(), "the cattwo/ dir exists");

  tnext.append("hitAnyKey.jpg");
  test.is(tnext.fileSize, 20669, "the cattwo/hitAnyKey.jpg file exists");

  test.finished();
}

testsuite.addTest("Extract", test_extractall_archDoesNotExist,
    "archive file does not exist");
testsuite.addTest("Extract", test_extractall_notZip,
    "archive file is not valid");
testsuite.addTest("Extract", test_extractall,
    "extract an archive", fixture);

testsuite.run(function(){});
