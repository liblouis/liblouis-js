/*globals
	Module,
	FS,
	stringToUTF16
*/

(function(ns) { "use strict";

var TABLE_URL = '';

//function file_exists(path) {
	//try {
		//FS.lookupPath(path);
	//} catch(e) {
		//return false;
	//}

	//return true;
//}

var FS_ORIGINAL_LOOKUP = FS.lookup;
var FS_DYNAMIC_LOOKUP = function dynloader(parent, name) {
	FS.lookup = FS_ORIGINAL_LOOKUP;

	var res;

	if(/*!file_exists(parent + name) &&*/
		/(\.cti|\.ctb|\.utb|\.dis|\.uti)$/.test(name)) {
		var url = TABLE_URL + name;
		res = FS.createLazyFile(parent, name, url, true, true);
	} else {
		res = FS.lookup.apply(this, [parent, name]);
	}

	FS.lookup = FS_DYNAMIC_LOOKUP;
	return res;
};

ns.liblouis = {
	version: Module.cwrap('lou_version', 'string'),

	setLogLevel: Module.cwrap('lou_setLogLevel', 'number'),

	registerLogCallback: function(fn) {

		if(ns._log_callback_fn_pointer) {
			Runtime.removeFunction(ns._log_callback_fn_pointer);
		}

		if(fn !== null) {
			ns._log_callback_fn_pointer = Runtime.addFunction(function(logLvl, msg) {
				fn(logLvl, Pointer_stringify(msg));
			});
		} else {
			ns._log_callback_fn_pointer = null;
		}


		Module.ccall('lou_registerLogCallback', 'void', ['pointer'],
				[ns._log_callback_fn_pointer]);
	},

	backTranslateString: function(table, inbuf) {
		return ns.liblouis.translateString(table, inbuf, true);
	},

	translateString: function(table, inbuf, backtranslate) {

		if(typeof inbuf !== "string" || inbuf.length === 0) {
			return "";
		}

		var mode = 0;

		var bufflen = inbuf.length*4+2;
		var inbuff_ptr = Module._malloc(bufflen);
		var outbuff_ptr = Module._malloc(bufflen);

		// UCS-2 to UTF-16LE 
		// TODO: internally no conversion is done, only copies values
		// to memory, which is okay for BMP
		// TODO: this writes an unnecessary null byte
		stringToUTF16(inbuf, inbuff_ptr, bufflen);

		// in emscripten we need a 32bit cell for each pointer
		var bufflen_ptr = Module._malloc(4);
		var strlen_ptr = Module._malloc(4);

		Module.setValue(bufflen_ptr, bufflen, "i32");
		Module.setValue(strlen_ptr, bufflen, "i32");

		var success = Module.ccall(backtranslate ? 'lou_backTranslateString' : 'lou_translateString', 'number', ['string', 'number', 'number', 'number', 'number', 'number', 'number'],
				[table, inbuff_ptr, strlen_ptr, outbuff_ptr, bufflen_ptr, null, null, mode]);

		if(!success) {
			console.error("failed to translate string");
			return null;
		}

		// string does not seam to be terminated by null byte,
		// therefore we cannot use emscripten to convert the buffer to
		// string.
		//var outstr = UTF16ToString(outbuff_ptr);
		var start_index = outbuff_ptr >> 1;
		var end_index = start_index + Module.getValue(bufflen_ptr, "i32");
		var outstr_buff = Module.HEAP16.slice(start_index, end_index);

		Module._free(outbuff_ptr);
		Module._free(inbuff_ptr);
		Module._free(bufflen_ptr);
		Module._free(strlen_ptr);

		return String.fromCharCode.apply(null, outstr_buff);
	},

	getTable: Module.cwrap('lou_getTable', 'number', ['string']),
	checkTable: Module.cwrap('lou_checkTable', 'number', ['string']),

	free: Module.cwrap('lou_free'),
	charSize: Module.cwrap('lou_charSize', 'number'),

	loadTable: function(tablename, url) {
		FS.createPreloadedFile('/', tablename, url, true, true);
	},

	enableOnDemandTableLoading: function(tableurl) {
		TABLE_URL = tableurl;
		FS.lookup = FS_DYNAMIC_LOOKUP;
	},

	disableOnDemandTableLoading: function(tableurl) {
		TABLE_URL = tableurl;
		FS.lookup = FS_ORIGINAL_LOOKUP;
	}
};

ns.liblouis.LOG = {};
ns.liblouis.LOG[ns.liblouis.LOG.ALL   =     0] = "ALL";
ns.liblouis.LOG[ns.liblouis.LOG.DEBUG = 10000] = "DEBUG";
ns.liblouis.LOG[ns.liblouis.LOG.INFO  = 20000] = "INFO";
ns.liblouis.LOG[ns.liblouis.LOG.WARN  = 30000] = "WARN";
ns.liblouis.LOG[ns.liblouis.LOG.ERROR = 40000] = "ERROR";
ns.liblouis.LOG[ns.liblouis.LOG.FATAL = 50000] = "FATAL";
ns.liblouis.LOG[ns.liblouis.LOG.OFF   =  6000] = "OFF";

})(this);
