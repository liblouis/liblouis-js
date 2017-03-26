// phantom js does not support require.resolve,
// this is a workaround
var BUILDS_PATH = module._getFilename("liblouis-build");
BUILDS_PATH = BUILDS_PATH.match(/(.*)[\/\\]/)[1] || '';
module.exports = BUILDS_PATH;
