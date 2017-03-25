var testrunner = require("../testrunner/testrunner");
testrunner.groupStart("rudimentary functional tests");

var assert = testrunner.assert;

assert("test", true);
assert("test 2", true);
assert("test 3", false);
throw new Error("exception msg");
assert("test 4", true);
assert("test 4", true);
