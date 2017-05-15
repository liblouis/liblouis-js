(function ( root, factory ) {
    if ( typeof exports === 'object' ) {
        // CommonJS
        factory(exports);
    } else if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else {
        // Browser globals
        factory({browserGlobal: true}, root);
    }
}(this, function(liblouis, ns) { "use strict";

var API_METHODS = ["version", "setLogLevel", "getTable", "checkTable", "free",
	"charSize", "setDataPath", "getDataPath", "getFilesystem",
	"registerLogCallback", "backTranslateString", "translateString",
	"compileString", "loadTable", "enableOnDemandTableLoading",
	"disableOnDemandTableLoading"];

var IS_BROWSER_GUI_THREAD = typeof window !== 'undefined';
var IS_WEB_WORKER = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
var IS_NODE = !IS_BROWSER_GUI_THREAD && !IS_WEB_WORKER;

function createWorker() {
	var blob = new Blob([[
		"var CMD = {",
			"init: function(path) {",
				// TODO: this is kind of dangerous...
				'importScripts(path.capi);',
				'importScripts(path.easyapi);',
				'liblouis.registerLogCallback(function(logLevel, msg){',
					'self.postMessage({isLog: true, level: liblouis.LOG[logLevel], msg: msg});',
				'});',
			"},",
			"lou: function(data) {",
				"if(LiblouisEasyApi.prototype.hasOwnProperty(data.fn) && typeof liblouis[data.fn] == 'function') {",	
					"return liblouis[data.fn].apply(liblouis, data.args);",
				"}",
				"return null",
			"}",
		"};",

		"self.onmessage = function (ev) {",
			"var msg = ev.data;",
			"if(!msg.cmd || !CMD.hasOwnProperty(msg.cmd)) {",
				"return;",
			"}",

			"var res = CMD[msg.cmd](msg.data);",
			"self.postMessage({",
				"callId: msg.callId,",
				"data: res",
			"});",
		"};"
	].join("\n")], { type: "text/javascript" });
	return new Worker(window.URL.createObjectURL(blob));
}

function bindDynLoader(self) {
	if(!self.capi.FS_ORIGINAL_LOOKUP) {
		self.capi.FS_ORIGINAL_LOOKUP = self.capi.FS.lookup;
	}

	return function dynLoader(parent, name) {
		self.capi.FS.lookup = self.capi.FS_ORIGINAL_LOOKUP;

		var res;

		if(/(\.cti|\.ctb|\.utb|\.dis|\.uti|\.tbl|\.dic)$/.test(name)) {
			var url = self.capi.TABLE_URL + name;
			res = self.capi.FS.createLazyFile(parent, name, url, true, true);
		} else {
			res = self.capi.FS.lookup.apply(this, [parent, name]);
		}

		self.capi.FS.lookup = dynLoader;
		return res;
	};
}

var MEM = {
	// Memory Interface for 16bit Unicode Builds
	"2": {
		getBufferLength: function(buff) {
			return (buff.length+1)*2;
		},

		transfer: function(capi, buff) {
			var bufflen = MEM["2"].getBufferLength(buff);
			var buff_ptr = capi._malloc(bufflen);

			capi.stringToUTF16(buff, buff_ptr, bufflen);

			return buff_ptr;
		},

		read: function(capi, buffptr, bufflenptr) {
			if(!bufflenptr) { // null-terminated string
				return capi.UTF16ToString(buffptr);
			} else {
				var start_index = buffptr >> 1;
				var end_index = start_index + capi.getValue(bufflenptr, "i32");
				var outstr_buff = capi.HEAPU16.slice(start_index, end_index);
				return outstr_buff;
			}
		},

		buffToString: function(buff) {
			return String.fromCharCode.apply(null, buff);
		}
	},

	// Memory Interface for 32bit Unicode Builds
	"4": {
		getBufferLength: function(buff) {
			return (buff.length+1)*4;
		},

		transfer: function(capi, buff) {
			var bufflen = MEM["4"].getBufferLength(buff);
			var buff_ptr = capi._malloc(bufflen);

			capi.stringToUTF32(buff, buff_ptr, bufflen);

			return buff_ptr;
		},

		read: function(capi, buffptr, bufflenptr) {
			if(!bufflenptr) { // null-terminated string
				return capi.UTF32ToString(buffptr);
			} else {
				var start_index = buffptr >> 2;
				var end_index = start_index + capi.getValue(bufflenptr, "i32");
				var outstr_buff = capi.HEAPU32.slice(start_index, end_index);
				return outstr_buff;
			}
		},

		buffToString: function(buff) {
			var str = "";

			for(var i = 0; i < buff.length; ++i) {
				var utf32 = buff[i];
				// taken from emscripten, which ported it from
				// http://unicode.org/faq/utf_bom.html#utf16-3
				if (utf32 >= 0x10000) {
					var ch = utf32 - 0x10000;
					str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
				} else {
					str += String.fromCharCode(utf32);
				}
			}

			return str;
		}
	}
};

var IMPL = {};

// Implementation for 16bit and 32bit unicode liblouis builds
IMPL.lou = {
	version: function() { return this.capi.ccall('lou_version', 'string', [], []); },
	setLogLevel: function(num) { return this.capi.ccall('lou_setLogLevel', 'void', ['number'], [num]); },
	getTable: function(str) { return this.capi.ccall('lou_getTable', 'number', ['string'], [str]); },
	checkTable: function(str) { return this.capi.ccall('lou_checkTable', 'number', ['string'], [str]); },
	free: function() { return this.capi.ccall('lou_free', 'void', [], []); },
	charSize: function() { return this.capi.ccall('lou_charSize', 'number', [], []); },
	setDataPath: function(path) { this.capi.ccall('lou_setDataPath', 'number', ["string"], [path]); },
	getDataPath: function() { return this.capi.ccall('lou_getDataPath', 'string', [], []); },
	getFilesystem: function() { return this.capi.FS; },

	compileString: function(table, opcodes) {
		var success = this.capi.ccall('lou_compileString', 'number', ['string', 'string'], [table, opcodes]);
		return !!success;
	},

	registerLogCallback: function(fn) {

		if(this.capi._log_callback_fn_pointer) {
			this.capi.Runtime.removeFunction(this.capi._log_callback_fn_pointer);
		}

		if(fn === null) {
			fn = easyApiDefaultLogCallback;
		}

		var self = this;
		this.capi._log_callback_fn_pointer = this.capi.Runtime.addFunction(function(logLvl, msg) {
			fn(logLvl, self.capi.Pointer_stringify(msg));
		});

		this.capi.ccall('lou_registerLogCallback', 'void', ['pointer'],
				[this.capi._log_callback_fn_pointer]);
	},

	backTranslateString: function(table, inbuf) {
		return IMPL.lou.translateString.call(this, table, inbuf, true);
	},

	translateString: function(table, inbuf, backtranslate) {

		if(typeof inbuf !== "string" || inbuf.length === 0) {
			return "";
		}

		var mode = 0;

		var inbuff_ptr = this.mem.transfer(this.capi, inbuf);
		var bufflen = this.mem.getBufferLength(inbuf);
		var outbuff_ptr = this.capi._malloc(bufflen);

		var bufflen_ptr = this.capi._malloc(4);
		var strlen_ptr = this.capi._malloc(4);

		this.capi.setValue(bufflen_ptr, bufflen, "i32");
		this.capi.setValue(strlen_ptr, bufflen, "i32");

		var success = this.capi.ccall(backtranslate ?
				'lou_backTranslateString' :
				'lou_translateString', 'number', ['string',
				'number', 'number', 'number', 'number',
				'number', 'number'], [table, inbuff_ptr,
				strlen_ptr, outbuff_ptr, bufflen_ptr, null,
				null, mode]);

		if(!success) {
			return null;
		}

		var outbuff = this.mem.read(this.capi, outbuff_ptr, bufflen_ptr);

		this.capi._free(outbuff_ptr);
		this.capi._free(inbuff_ptr);
		this.capi._free(bufflen_ptr);
		this.capi._free(strlen_ptr);

		return this.mem.buffToString(outbuff);
	},

	enableOnDemandTableLoading: function(tableurl) {
		if(IS_BROWSER_GUI_THREAD) {
			throw new Error("This feature is only available in web " +
				"workers and nodeJS");
		}

		this.capi.TABLE_URL = tableurl;
		if(!IS_NODE) {
			this.capi.FS.lookup = bindDynLoader(this);
		} else {
			this.disableOnDemandTableLoading();

			this.capi.FS.mkdir('/tables');

			var tablefolder = tableurl;

			if(!tablefolder) {
				var path = require('path');
				var buildpath = require.resolve('liblouis-build');
				tablefolder = path.resolve(path.dirname(buildpath), "tables/");
			}

			try {
				this.capi.FS.mount(this.capi.FS.filesystems.NODEFS, { root: tablefolder }, '/tables');
			} catch(e) {
				console.error(e);
				throw new Error("mounting of table folder failed");
			}
		}
	},

	disableOnDemandTableLoading: function() {
		if(!IS_NODE) {
			this.capi.FS.lookup = this.capi.FS_ORIGINAL_LOOKUP;
		} else if(node_dirExists(this.capi, '/tables')) {
			try {
				this.capi.FS.unmount('/tables');
			} catch(e) { }

			try {
				this.capi.FS.rmdir('/tables');
			} catch(e) {
				throw new Error("removal of mounted table folder failed");
			}
		}
	}
};

// Implementation for 16bit and 32bit unicode liblouis+liblouisutdml builds
IMPL.lbu = {
	version: function() {
		return capi.ccall('lbu_version', 'string', [], []);
	},
	free: function() {
		return capi.ccall('lbu_free', 'string', [], []);
	},
	setLogLevel: IMPL.lou.setLogLevel,
	getTable: IMPL.lou.getTable,
	checkTable: IMPL.lou.checkTable,
	charSize: IMPL.lou.charSize,
	setDataPath: IMPL.lou.setDataPath,
	getDataPath: IMPL.lou.getDataPath,
	getFilesystem: IMPL.lou.getFilesystem,
	registerLogCallback: IMPL.lou.registerLogCallback,
	compileString: IMPL.lou.compileString,
};

// Implementation for async usage. By default they are generated to be
// identical to the normal implementations with an additional callback
// as last parameter. This object overwrites the default implementation.
IMPL.worker = {
	registerLogCallback: function(cb) {
		if(cb === null) {
			this.logCallback = easyApiDefaultLogCallback;
		} else {
			this.logCallback = cb;
		}
	},

	getFilesystem: function() { throw new Error("cannot get filesystem of async liblouis instance"); },

	enableOnDemandTableLoading: function(url, fn) {
		if(IS_BROWSER_GUI_THREAD) {
			url = window.location.origin + "/" + url;
		}

		fn = fn || NOOP;
		dispatch(this, "enableOnDemandTableLoading", [url, fn]);
	}
};

function NOOP() {}

function hasLbu(capi) { // is utdml build
	if(capi._hasLbu !== void 0) {
		return capi._hasLbu;
	}

	return typeof capi._lbu_version == "function";

	// above may change in emscripten as it is a not documented feature.
	// Below works and is documented, but generates a warning in the
	// console:
	//
	//try {
		//capi.ccall('lbu_version', 'string', [], []);
		//capi._hasLbu = true;
	//} catch(e) {
		//capi._hasLbu = false;
	//}
}

function defaultLiblouisBuild() {
	if(!IS_NODE) {
		if(typeof liblouisBuild !== "undefined") {
			return liblouisBuild;
		}

		if(typeof liblouis_emscripten !== "undefined") {
			return liblouis_emscripten;
		}
		
		if(typeof Module !== "undefined") {
			return Module;
		}
	} else {
		return require("liblouis-build");
	}

	return null;
}

function LiblouisEasyApiAsync(opts) {

	if(IS_NODE) {
		throw new Error("Async API is only available in browser environments.");
	}

	this.registerLogCallback(null);

	this.callId = 1;
	this.cbs = { "0": function(){} };
	this.worker = createWorker();

	var self = this;
	this.worker.addEventListener("message", function(e) {
		self.resolveDispatch(e.data);
	});

	var prefix = "";

	if(IS_BROWSER_GUI_THREAD) {
		prefix = window.location.origin + "/";
	}

	this.worker.postMessage({
		cmd: "init",
		callId: 0,
		data: {
			capi: prefix + opts.capi,
			easyapi: prefix + opts.easyapi
		}
	});
}

LiblouisEasyApiAsync.prototype.resolveDispatch = function(msg) {
	if(msg && msg.isLog) {
		this.logCallback(msg.level, msg.msg);
		return;
	}

	if(!msg || typeof msg.callId !== "number" || typeof this.cbs[msg.callId] !== "function") {
		console.debug("recieved bougus message from worker:", msg);
		return;
	}

	this.cbs[msg.callId](msg.data);
	this.cbs[msg.callId] = null;
	delete this.cbs[msg.callId];
};

for(var i = 0; i < API_METHODS.length; ++i) {
	LiblouisEasyApiAsync.prototype[API_METHODS[i]] = IMPL.worker[API_METHODS[i]] || genDispatch(API_METHODS[i]);
}

function genDispatch(fn) {
	return function() {
		dispatch(this, fn,
			Array.prototype.slice.call(arguments));
	};
}

function dispatch(self, fn, args) {
	if(args.length < 1) { return; }
	self.cbs[self.callId] = args[args.length-1];
	self.worker.postMessage({
		callId: self.callId,
		cmd: "lou",
		data: {
			args: args.slice(0, -1),
			fn: fn
		}
	});
	self.callId++;
}

function LiblouisEasyApi(build) {
	build = build || defaultLiblouisBuild();

	if(typeof build === "string") {
		var builds = LiblouisEasyApi.getAvailableBuilds();
		if(!builds.hasOwnProperty(build)) {
			throw new Error("no liblouis build for requested version loaded");
		}
		// there may be multiple builds, always grab the first one
		build = builds[build][0];
	}

	if(typeof build === "function") {
		build = build();
	}

	if(!build || !build._lou_version) {
		throw new Error("argument cannot be resolved to a liblouis build.");
	}

	this.capi = build;
	this.impl = hasLbu(build) ? IMPL.lbu : IMPL.lou;
	this.mem = this.charSize() === 4 ? MEM["4"] : MEM["2"];

	this.registerLogCallback(null);
}

for(i = 0; i < API_METHODS.length; ++i) {
	LiblouisEasyApi.prototype[API_METHODS[i]] = genBridge(API_METHODS[i]);
}

function genBridge(fn) {
	return function(arg1, arg2, arg3) {
		if(!this.impl.hasOwnProperty(fn)) {
			throw new Error("Your build does not support this method. Include a build containing liblouisutdml.");
		}

		return this.impl[fn].call(this, arg1, arg2, arg3);
	};
}

LiblouisEasyApi.prototype.getAvailableBuilds = LiblouisEasyApi.getAvailableBuilds = function() {
	return ns.liblouisBuilds || {};
};


LiblouisEasyApi.prototype.LOG = {};
LiblouisEasyApi.prototype.LOG[LiblouisEasyApi.prototype.LOG.ALL   =     0] = "ALL";
LiblouisEasyApi.prototype.LOG[LiblouisEasyApi.prototype.LOG.DEBUG = 10000] = "DEBUG";
LiblouisEasyApi.prototype.LOG[LiblouisEasyApi.prototype.LOG.INFO  = 20000] = "INFO";
LiblouisEasyApi.prototype.LOG[LiblouisEasyApi.prototype.LOG.WARN  = 30000] = "WARN";
LiblouisEasyApi.prototype.LOG[LiblouisEasyApi.prototype.LOG.ERROR = 40000] = "ERROR";
LiblouisEasyApi.prototype.LOG[LiblouisEasyApi.prototype.LOG.FATAL = 50000] = "FATAL";
LiblouisEasyApi.prototype.LOG[LiblouisEasyApi.prototype.LOG.OFF   = 60000] = "OFF";

LiblouisEasyApi.prototype._CONSOLE_MAPPING = {
	ALL: "log",
	DEBUG: "log",
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
	FATAL: "error",
};

LiblouisEasyApi.prototype._defaultLogCallback = easyApiDefaultLogCallback;

function easyApiDefaultLogCallback(lvl_id, msg) {
	var lvl_name = LiblouisEasyApi.prototype.LOG[lvl_id];
	msg = "["+lvl_name+"] " + msg;

	if(typeof console != "undefined") {
		var fn = console[LiblouisEasyApi.prototype._CONSOLE_MAPPING[lvl_name]];
		if(fn) {
			fn(msg);
		} else {
			console.log(msg);
		}
	}
}

function node_dirExists(capi, path) {
	try {
		capi.FS.lookupPath(path);
		return true;
	} catch(e) {
		return false;
	}
}

// create a default instance in browser environments
if(liblouis.browserGlobal) {
	if(defaultLiblouisBuild()) {
		ns.liblouis = new LiblouisEasyApi();
	}

	ns.LiblouisEasyApi = LiblouisEasyApi;
	ns.LiblouisEasyApiAsync = LiblouisEasyApiAsync;
} else {
	liblouis.EasyApi = LiblouisEasyApi;
	liblouis.EasyApiAsync = LiblouisEasyApiAsync;
}

}));
