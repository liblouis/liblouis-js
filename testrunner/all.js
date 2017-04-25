var execSync = require('child_process').execSync;
var path = require('path');

process.chdir(path.resolve(__dirname, ".."));

execSync("node ./testrunner/browser", {stdio:'inherit'});
execSync("node ./testrunner/node", {stdio:'inherit'});
