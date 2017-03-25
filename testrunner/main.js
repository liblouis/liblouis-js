var testrunner = require("./testrunner");
var assert = testrunner.assert;

require("../tests/loadable");

testrunner.groupEnd();
testrunner.exit();
