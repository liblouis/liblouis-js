var testrunner = require("../testrunner/testrunner");
testrunner.groupStart("rudimentary per build tests");

var assert = testrunner.assert;
var EasyApi = require("../easy-api").EasyApi;
var builds = require("../testrunner/builds");
var buildlist = builds.getBuilds();

for(var i = 0; i < buildlist.length; ++i) {
	var buildname = buildlist[i];

	var build = require("liblouis-build/"+buildname);

	var liblouis = new EasyApi(build);
	assert(buildname + " can be loaded", true);

	var tbl = builds.tableFolder(buildname);

	if(!builds.embededTables(buildname)) {
		var can = true;

		try {
			liblouis.enableOnDemandTableLoading();
		} catch(e) {
			console.error(e);
			can = false;
		}
		assert(buildname + " can enable on demand table loading", can);

	}

	var version = liblouis.version();
	assert(buildname + " can get version",
		typeof version === "string" && version.length > 0);

	assert(buildname + "knows if its UTF-16 or UTF-32",
		liblouis.charSize() === builds.charSize(buildname));

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
}

