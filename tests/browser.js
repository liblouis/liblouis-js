function listOfBuildsLoaded() {
	var str = [];
	for (var p in liblouisBuilds) {
		if (liblouisBuilds.hasOwnProperty(p)) {
			str.push(liblouisBuilds[p].length + "x version " + p);
		}
	}
	return str.join(",");
}

function countBuilds() {
	var cnt = 0;
	for (var p in liblouisBuilds) {
		if (liblouisBuilds.hasOwnProperty(p)) {
			cnt+=liblouisBuilds[p].length;
		}
	}
	return cnt;
}

function tests() {
	// Note: JSON.stringify segfaults on windows...
	try {
		assert("exposes exactly one liblouis build",
			countBuilds() === 1);

		var liblouis = new LiblouisEasyApi(liblouisBuild);

		var version = liblouis.version();

		console.log("[INFO] Liblouis version:", version);
		console.log("[INFO] Liblouis unicode:", liblouis.charSize()*8 +"bit");

		if(typeof liblouisBuilds !== "undefined") {
			console.log("[INFO] List of builds loaded:", listOfBuildsLoaded());
		}
	
		assert("can get version",
			typeof version === "string" && version.length > 0);
	} catch(e) {
		console.log("[EXCEPTION]", e + JSON.stringify(e));
		failed++;
	}

	exit();

	return failed || 0;
}
