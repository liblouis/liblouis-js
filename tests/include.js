var testrunner = require("../testrunner/testrunner");
testrunner.groupStart("rudimentary include/require tests");

var assert = testrunner.assert;

var liblouis = require("../liblouis");
assert("can be required", true);

var version = liblouis.version();
assert("can get version of default instance", typeof version === "string" &&
	version.length > 0);

var EasyApi = require("../easy-api").EasyApi;

var builds = require("../testrunner/builds");
var buildlist = builds.getBuilds();

var embededBuild = require("liblouis-build/" + buildlist[buildlist.length-1]);

var embededLiblouis = new EasyApi(embededBuild);

assert("can require non default build instance", true);
