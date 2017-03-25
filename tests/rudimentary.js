var testrunner = require("../testrunner/testrunner");
testrunner.groupStart("rudimentary per build tests");

var assert = testrunner.assert;
var EasyApi = require("../easy-api").EasyApi;

var BUILDS = {
	"build-tables-embeded-root-utf16" : {charSize: 2, embededTables: true  },
	"build-tables-embeded-root-utf32" : {charSize: 4, embededTables: true  },
	"build-no-tables-utf16"           : {charSize: 2, embededTables: false },
	"build-no-tables-utf32"           : {charSize: 4, embededTables: false },
};

for(var buildname in BUILDS) { if(BUILDS.hasOwnProperty(buildname)) {

	var build = require("liblouis-build/"+buildname);

	var liblouis = new EasyApi(build);
	assert(buildname + " can be loaded", true);

	if(!BUILDS[buildname].embededTables) {
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
		liblouis.charSize() === BUILDS[buildname].charSize);

	assert(buildname + " can translate simple ASCII string",
		liblouis.translateString("de-de-g0.utb", "Hallo") ===
		"hallo");

	assert(buildname + " can translate simple BMP string",
		liblouis.translateString("unicode.dis,de-de-g0.utb", "cliché") ===
		"⠉⠇⠊⠉⠓⠈⠑");

	assert(buildname + " can translate simple SMP string",
		liblouis.translateString("unicode.dis,de-de-g0.utb", "cliché") ===
		"⠉⠇⠊⠉⠓⠈⠑");

	assert(buildname + " test before string compile",
		liblouis.translateString("unicode.dis,de-de-g0.utb", "1") ===
		"⠼⠁");

	//liblouis.compileString("tables/unicode.dis,tables/de-de-g0.utb", "numsign 123456");
	//assert(buildname + "can use compileString",
		//liblouis.translateString("unicode.dis,de-de-g0.utb", "1") ===
		//"⠿⠁");
}}

