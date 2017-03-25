var URL = "http://localhost:8080/";
var PREFIX = "[PHANTOMJS] ";

var BUILDS = require("./builds");
var BUILDS_ARR = toArray(BUILDS);
var BUILDS_PATH = require("./buildpath");

// strip filename, dirname remains:
BUILDS_PATH = BUILDS_PATH.match(/(.*)[\/\\]/)[1] || '';

var webpage = require('webpage');

var fails = 0;

var numRun = 0;
var allRun = BUILDS_ARR.length;

function log(msg) {
	console.log(PREFIX + msg);
}

// taken from the docs
// http://phantomjs.org/api/phantom/handler/on-error.html
phantom.onError = phantom.onResourceError = function(msg, trace) {
	var msgStack = ['PHANTOM ERROR: ' + msg];
	if (trace && trace.length) {
		msgStack.push('TRACE:');
		trace.forEach(function(t) {
			msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
		});
	}
	console.error(msgStack.join('\n'));
	phantom.exit(1);
};

log("starting browser tests");

var currBuild = 0;

function testBuildLoop() {
	currBuild++;
	testBuild(BUILDS_ARR[currBuild-1].name, testBuildLoop);
}
testBuildLoop();

function testBuild(buildname, cb) {
	var pageFails = 0;
	var page = webpage.create();
	var buffConsole = new BufferedConsole();
	page.onConsoleMessage = function(msg) {
		buffConsole.log(msg);
	};
	page.open(URL + 'testrunner/index.html', function(status) {
		if (status !== "success") {
			log("FAILED to start tests for build " + buildname);
			fails++;
			numRun++;
			checkDone();
			cb();
		} else {
			log("start testing build " + buildname);

			// page.injectJS segfaults... seems to be a bug in phantomjs
			page.includeJs(URL + 'node_modules/liblouis-build/' + buildname + '.js', function() {
			page.includeJs(URL + 'easy-api.js',                                      function() {
			page.includeJs(URL + 'tests/browser.js',                                 function() {
				log("loaded scripts successfully " + buildname);

				pageFails = page.evaluate(function() {
					console.log(liblouis.version());
					window.onload = function() {
						console.log(liblouis.version());
						return tests();
					};
				});

				fails += pageFails;
				numRun++;

				log(buildname + " has " + pageFails + " failed tests");
				log(buildname + " log output:");
				buffConsole.dump();
				log("-----------------------------------------------------------");

				checkDone();
				cb();
			});});});
		}
	});
}

function checkDone() {
	if(numRun === allRun) {
		printResults();
		phantom.exit(fails);
	}
}

function BufferedConsole() {
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

function printResults() {
	log("===========================================================");
	log("NUMBER OF FAILED TESTS: " + fails);
	log("===========================================================");
}

function toArray() {
	var arr = [];
	for(var buildname in BUILDS) { if(BUILDS.hasOwnProperty(buildname)) {
		var val = BUILDS[buildname];
		val.name = buildname;
		arr.push(val);
	}}
	return arr;
}
