// todo: this whole module needs to be cross platform
//

function extractall(archive, target)
{
  let zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"]
           .createInstance(Components.interfaces.nsIZipReader);

  try {
    zipReader.open(archive);
  }
  catch(
      e if e.result === Components.results.NS_ERROR_FILE_TARGET_DOES_NOT_EXIST)
  {
    throw new Error(arguments.callee.caller.name
        +"() --> zipfile.extractall(): Zip archive '"+
        archive.leafName +"' does not exist.");
  }
  catch(
      e if e.result === Components.results.NS_ERROR_FILE_CORRUPTED)
  {
    throw new Error(arguments.callee.caller.name
        +"() --> zipfile.extractall(): Zip archive '"+
        archive.leafName +"' is corrupted.");
  }

  // todo: we need to see what happens when a test fails
  // and decide how to catch it
  zipReader.test(null);

  // create directories first
  let entries = zipReader.findEntries("*/");
  while(entries.hasMore())
  {
    let name = entries.getNext();
    let targ = getTargetFile(target, name);
    if(!targ.exists())
      targ.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, 0777);
  }

  // extract entries into newly created directories
  entries = zipReader.findEntries(null);
  while(entries.hasMore())
  {
    let name = entries.getNext();
    let targ = getTargetFile(target, name);
    // skip the directories we already created
    if(targ.exists())
      continue;

    targ.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, 0777);
    zipReader.extract(name, targ);
  }
  zipReader.close();
}

function getTargetFile(target, itemName)
{
  var rv = target.clone();
  var parts = itemName.split("/");
  for (var i = 0; i < parts.length; ++i)
    rv.append(parts[i]);
  return rv;
}
