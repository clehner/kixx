function isarray(val)
{
  if(!val || typeof val != "object")
    return false;
  if(!val.constructor || val.constructor.name != "Array")
    return false;
  return true;
}

function isreference(a)
{
  if(a == null) return false;
  return typeof a == "object" || typeof a == "function";
}

function eq(a, b)
{
  // first shortcut (functions are taken care of here)
  if(a === b) return true;

  if(typeof a != typeof b)
    return false;

  // if they are both functions:
  if(typeof a == "function") return false;
 
  // are they references?
  let aisref = isreference(a);
  let bisref = isreference(b);
  
  // if neither are references we can do this:
  if(!aisref && !bisref) return false;

  // if one is a ref and the other is not, we can do this:
  if(aisref ^ bisref) return false;

  // if they are dates, we need to do this, since the deep comparison
  // will always return true
  if(a.constructor.name == "Date") return false;

  // are they arrays?
  let aisarray = isarray(a);
  let bisarray = isarray(b);
  if(aisarray ^ bisarray) return false;

  if(aisarray)
  {
    if(a.length != b.length) return false;

    for(let i = 0; i < a.length; i++) {
      if(!arguments.callee(a[i], b[i]))
        return false;
    }
    return true;
  }

  for(let n in a)
  {
    if(!(n in b)) return false;

    if(!arguments.callee(a[n], b[n]))
      return false;
  }

  return true;
}
