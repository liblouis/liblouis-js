var testrunner = require("../testrunner/testrunner");
testrunner.groupStart("rudimentary per build tests");

var assert = testrunner.assert;
var EasyApi = require("../easy-api").EasyApi;
var BUILDS = require("../testrunner/builds");

for(var buildname in BUILDS) { if(BUILDS.hasOwnProperty(buildname)) {

	var build = require("liblouis-build/"+buildname);

	var liblouis = new EasyApi(build);
	assert(buildname + " can be loaded", true);

	var tbl = "";

	if(!BUILDS[buildname].embededTables) {
		var can = true;
		try {
			liblouis.enableOnDemandTableLoading();
		} catch(e) {
			console.error(e);
			can = false;
		}
		assert(buildname + " can enable on demand table loading", can);

		tbl = BUILDS[buildname].tableFolder;
	}

	var version = liblouis.version();
	assert(buildname + " can get version",
		typeof version === "string" && version.length > 0);

	assert(buildname + "knows if its UTF-16 or UTF-32",
		liblouis.charSize() === BUILDS[buildname].charSize);

	assert(buildname + " can translate simple ASCII string",
		liblouis.translateString(tbl + "de-de-g0.utb", "Hallo") ===
		"hallo");

	assert(buildname + " can translate simple BMP string",
		liblouis.translateString(tbl + "unicode.dis," + tbl + "de-de-g0.utb", "cliché") ===
		"⠉⠇⠊⠉⠓⠈⠑");

	assert(buildname + " can translate simple SMP string",
		liblouis.translateString(tbl + "unicode.dis," + tbl + "de-de-g0.utb", "cliché") ===
		"⠉⠇⠊⠉⠓⠈⠑");

	assert(buildname + " test before string compile",
		liblouis.translateString(tbl + "unicode.dis," + tbl + "de-de-g0.utb", "1") ===
		"⠼⠁");

	liblouis.compileString(tbl + "unicode.dis," + tbl + "de-de-g0.utb", "numsign 123456");
	assert(buildname + " can use compileString",
		liblouis.translateString(tbl + "unicode.dis," + tbl + "de-de-g0.utb", "1") ===
		"⠿⠁");
}}

