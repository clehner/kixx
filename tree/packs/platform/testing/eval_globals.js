exports.checkBackstage = function checkBackstage() {
  return BACKSTAGE;
};

exports.checkClosure = function checkClosure() {
  return aURI;
};

exports.checkOuter = function checkOuter() {
  return fetch;
};

exports.checkInner = function checkInner() {
  return this_exports;
};
