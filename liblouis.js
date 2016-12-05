var capi = require('./liblouis-no-tables');
var easyapi = require('./easy-api');
easyapi.setLiblouisBuild(capi);
exports = easyapi;
