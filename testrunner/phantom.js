// this script is written to test multiple builds in parallel or consecutively.
// However, testing multiple builds segfaults on windows. Try to invoke the
// program several times with a single build instead...

var PREFIX = "[PHANTOMJS] ";
phantom.onError = printError;


log("NEW PHANTOMJS INSTANCE BOOTED");

var MAXTIME_MS = 30000;

setTimeout(function() {
	log("KILLING INSTANCE AS TIME BUDGET OF " + (~~(MAXTIME_MS/1000)) + " SECONDS WAS EXHAUSTED");
	phantom.exit(1);
}, MAXTIME_MS);

var URL = "http://localhost:"+require("./hostport")+"/";

var fails = 0,                  // number of failed unit tests overall
    numRun = 0,                 // number of builds tested
    numFailedBuilds = 0,        // number of builds that failed tests or failed to load
    numFailedBuildLoads = 0;    // number of builds that failed to load


var system = require('system');
var args = system.args;

if(args.length <= 1) {
	log("NO BUILDS SPECIFIED.");
	phantom.exit(1);
}

var BUILDS = args[1].split(",");
var BUILDS_PATH = require("./phantomBuildPath");

var allRun = BUILDS.length; // number of builds that must be tested
var buildReportedPhantomErrors = []; // counts startup errors for each instance

var webpage = require('webpage');

function BufferedConsole() { // used to batch output of each test instance
	this.msg = [];
}

BufferedConsole.prototype.log = function(msg) {
	this.msg.push(msg);
};

BufferedConsole.prototype.dump = function(msg) {
	for(var i = 0; i < this.msg.length; ++i) {
		log(this.msg[i]);
	}
};

function testBuildLoop() {
	buildReportedPhantomErrors[numRun] = 0;
	testBuild(BUILDS[numRun], testBuildLoop);
}
testBuildLoop();

function testBuild(buildname, cb) {
	log(buildname + " Trying to load tests");

	var pageFails = 0;
	var page = webpage.create();

	var buffConsole = new BufferedConsole();

	page.onConsoleMessage = function(msg) { buffConsole.log(msg); };
	page.onError = printError;
	page.onAlert = printAlert;
	page.onResourceError = printResourceError;
	page.onResourceTimeout = printResourceTimeoutError;

	page.open(URL + 'testrunner/index/index.html?'+buildname, function(status) {
		// not finding the resource is a success...
		console.log("status:", status);
		console.log("errors:", buildReportedPhantomErrors[numRun]);
		if (status !== "success" || buildReportedPhantomErrors[numRun]) {
			log(buildname + " FAILED to load tests", buildReportedPhantomErrors[numRun]);
			numFailedBuilds++;
			numFailedBuildLoads++;
			numRun++;
			page.close();
			checkDone();
			cb();
		} else {
			log(buildname + " successfully loaded tests");

			pageFails = page.evaluate(function() {
				return tests();
			});

			if(+pageFails !== pageFails) {
				log("TEST SUITE FAILED TO PROVIDE NUMBER OF FAILED UNIT TESTS. FAILING BUILD...");
				pageFails = "unknown number of";
			} else {
				fails += pageFails;
			}

			if(pageFails !== 0) {
				numFailedBuilds++;
			}
			numRun++;

			log(buildname + " has " + pageFails + " failed tests");
			log(buildname + " log output:");
			log("--------------------------------------------------------------------");
			buffConsole.dump();
			log("--------------------------------------------------------------------");

			page.close();
			checkDone();
			cb();
		}
	});
}

function checkDone() {
	if(numRun === allRun) {
		printResults();
		log("EXITING PHANTOMJS INSTANCE NORMALLY. MAY SEGFAULT ON WINDOWS...");
		phantom.exit(Math.max(fails, numFailedBuilds));
	}
}

function printResults() {
	log("====================================================================");
	log("NUMBER OF BUILDS FAILING BROWSER TESTS: " + numFailedBuilds + "/" + allRun);
	log("NUMBER OF BUILDS FAILING TO LOAD: " + numFailedBuildLoads + "/" + allRun);
	log("NUMBER OF FAILED BROWSER UNIT TESTS OVERALL: " + fails);
	log("====================================================================");
}

function toArray(obj) {
	var arr = [];
	for(var prop in obj) { if(obj.hasOwnProperty(prop)) {
		var val = obj[prop];
		val.name = prop;
		arr.push(val);
	}}
	return arr;
}

function log(msg) {
	console.log(PREFIX + msg);
}

function printAlert(msg) {
	buildReportedPhantomErrors[numRun]++;
	log("[ALERT] " + msg);
}

// taken from the docs
// http://phantomjs.org/api/phantom/handler/on-error.html
function printError(msg, trace) {
	buildReportedPhantomErrors[numRun]++;
	var msgStack = ['[PHANTOM ERROR] ' + msg];
	if (trace && trace.length) {
		msgStack.push('TRACE:');
		trace.forEach(function(t) {
			msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
		});
	}
	log(msgStack.join('\n'));
}

function printResourceError(err) {
	buildReportedPhantomErrors[numRun]++;
	log("[RESOURCE ERROR] " + JSON.stringify(err));
}

function printResourceTimeoutError(err) {
	buildReportedPhantomErrors[numRun]++;
	log("[RESOURCE TIMEOUT] " + JSON.stringify(err));
}
