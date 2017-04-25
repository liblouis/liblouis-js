var successful = 0, failed = 0, groupSuccess = 0, groupFail = 0, groupName = null, exitonfailure = false,
	uncaughtException = false;

function yesno(val) {
	return val ? "YES": "NO";
}
function exit() {
	console.info("================================================================================");
	console.info("SUCCESS: "+successful+"      FAILURE: "+failed+"      EXCEPTION: "+yesno(uncaughtException)+"      DID EARLY EXIT: " + yesno(exitonfailure || uncaughtException));
	console.info("================================================================================");
	if(typeof process !== "undefined") {
		process.exit(failed);
	}
}

function groupEnd() {
	if(groupName) {
		console.info(groupName + " (" + groupSuccess + "/" + (groupSuccess + groupFail) + ")");
	}

	groupFail = groupSuccess = 0;
	groupName = null;
}

function groupStart(name) {
	if(groupName) {
		groupEnd();
	}

	groupName = name;
}

function assert(desc, result) {
	if(result) {
		successful++;
		groupSuccess++;
	} else {
		failed++;
		groupFail++;
		console.info("FAILED TEST: ", desc);
		console.info("--------------------------------------------------------------------------------");
		if(exitonfailure) {
			exit();
			return;
		}
	}
}

if(typeof module !== "undefined" && typeof process !== "undefined") {

module.exports = {
	
	assert: assert,

	exitOnFailure: function() {
		exitonfailure = true;
	},

	groupStart: groupStart,
	groupEnd: groupEnd,
	exit: exit,
};

process.on('uncaughtException', function(e) {
	failed++;
	uncaughtException = true;
	console.info("================================================================================");
	console.info("EXITING EARLY ON EXCEPTION");
	console.info("================================================================================");
	console.info(e);
	exit();
});

}
console.log("[INFO] loaded testrunner");
