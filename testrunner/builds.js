var path = require('path'), fs=require('fs');

function tryLoc(name) {
	var path;

	try {
		path = require.resolve(name);
	} catch(e) {
	}

	return path;
}

function findBuild(name) {
	return tryLoc("liblouis-build/"+name) ||
	tryLoc("../../out/"+name) ||
	tryLoc("../../../out/"+name);
}

function getBuilds(builddir) {
	var builds = process.argv.slice(2);

	if(builds.length === 0) {

		if(!builddir) {
			builddir = getBuildDir();
		}

		console.log("[INFO] Detecting builds in directory ", builddir);
		
		var files = fs.readdirSync(builddir);

		for(var i = 0; i < files.length ; i++) {
			var filename = path.join(builddir, files[i]);
			var stat = fs.lstatSync(filename);
			if (stat.isFile() && /^build-/.test(files[i])){
				builds.push(files[i]);
				console.log('[INFO] detected>', files[i]);
			}
		}
	} else {
		console.log("[INFO] " + builds.length + " test targets given per commandline argument.");
	}

	return builds;
}

function getBuildDir() {
	var builddir = require.resolve("liblouis-build");
	builddir = path.dirname(builddir);
	return builddir;
}

module.exports = {
	getBuildDir: getBuildDir,
	getBuilds: getBuilds,
	charSize: function(name) {
		return /utf16/.test(name) ? 2 : 4;
	},
	embededTables: function(name) {
		return !(/no-tables/.test(name));
	},
	tableFolder: function(name) {
		if (/no-tables/.test(name)) {
			return "tables/";
		} else {
			return "";
		}
	},
	wasm: function() {
		return /wasm/.test(name);
	}
};
