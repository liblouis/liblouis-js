console.log("[INFO] EXECUTING TESTS IN BROWSER ENVIRONMENT (PHANTOMJS)");

var path = require("path");
process.chdir(path.resolve(__dirname, ".."));

var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var hostport = require("./hostport");
exec("python -m SimpleHTTPServer "+hostport);

// TODO: should check python http server here...

console.log("[INFO] WAITING A FEW SECONDS UNTIL HTTP SERVER BOOTS...");

setTimeout(function() {
	var builds = require("./builds").getBuilds();
	var acc_ret = 0;
	for(var i = 0; i < builds.length; ++i) {
		try {
			acc_ret += execSync("phantomjs ./testrunner/phantom.js " + builds[i], {stdio:'inherit'});
		} catch(e) {
			acc_ret += 1;
		}
	}

	if(acc_ret === 0) {
		console.log("[INFO] ALL BROWSER TESTS PASSED!");
		process.exit(0);
	} else {
		console.log("[INFO] SOME BROWSER TESTS FAILED!");
		process.exit(1);
	}
}, 5000);

// TODO: should close python http server here...
