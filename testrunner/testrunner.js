var successful = 0, failed = 0, groupSuccess = 0, groupFail = 0, groupName = null, exitonfailure = false,
	uncaughtException = false;

function yesno(val) {
	return val ? "YES": "NO";
}
function exit() {
	console.info("--------------------------------------------------------------------------------");
	console.info("SUCCESS: %d      FAILURE: %d      EXCEPTION: %s      DID EARLY EXIT: %s",
			successful, failed, yesno(uncaughtException), yesno(exitonfailure || uncaughtException));
	console.info("--------------------------------------------------------------------------------");
	process.exit(failed);
}

function groupEnd() {
	if(groupName) {
		console.info("%s", groupName, "(", groupSuccess, "/", groupSuccess + groupFail, ")");
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

module.exports = {
	
	assert: function assert(desc, result) {
		if(result) {
			successful++;
			groupSuccess++;
		} else {
			failed++;
			groupFail++;
			console.error("FAILED TEST: ", desc);
			if(exitonfailure) {
				exit();
			}
		}
	},


	exitOnFailure: function() {
		exitonfailure = true;
	},

	groupStart: groupStart,
	groupEnd: groupEnd,
	exit: exit
};

process.on('uncaughtException', function(e) {
	failed++;
	uncaughtException = true;
	console.error("--------------------------------------------------------------------------------");
	console.error("EXITING EARLY ON EXCEPTION");
	console.error("--------------------------------------------------------------------------------");
	console.error(e);
	exit();
});
