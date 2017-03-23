var capi = require('liblouis-build');
var easyapi = require('./easy-api');
easyapi.setLiblouisBuild(capi);
module.exports = easyapi;
