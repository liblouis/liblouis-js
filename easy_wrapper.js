liblouis = {
	version: Module.cwrap('lou_version', 'string'),

	backTranslateString: function(table, inbuf) {
		return liblouis.translateString(table, inbuf, true);
	},

	translateString: function(table, inbuf, backtranslate) {
		var mode = 0;

		var bufflen = inbuf.length*4+2;
		var inbuff_ptr = Module._malloc(bufflen);
		var outbuff_ptr = Module._malloc(bufflen);

		// UCS-2 to UTF-16LE 
		// TODO: internally no conversion is done, only copies values
		// to memory, which is okay for BMP
		// TODO: this writes an unnecessary null byte
		var strlen = stringToUTF16(inbuf, inbuff_ptr, bufflen);

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

	//translate: Module.cwrap('lou_translate'),
	//dotsToChar: Module.cwrap('lou_dotsToChar'),
	//backTranslate: Module.cwrap('lou_backTranslate'),
	//hypenate: Module.cwrap('lou_hyphenate'),
	//compileString: Module.cwrap('lou_compileString'),
	//getTypeformForEmphClass: Module.cwrap('lou_getTypeformForEmphClass'),
	//charToDots: Module.cwrap('lou_charToDots'),
	//registerLogCallback: Module.cwrap('lou_registerLogCallback'),
	//setLogLevel: Module.cwrap('lou_setLogLevel'),
	//logFile: Module.cwrap('lou_logFile'),
	//logPrint: Module.cwrap('lou_logPrint'),
	//logEnd: Module.cwrap('lou_logEnd'),
	//setDataPath: Module.cwrap('lou_setDataPath'),
	//getDataPath: Module.cwrap('lou_getDataPath'),
	getTable: Module.cwrap('lou_getTable', 'number', ['string']),
	checkTable: Module.cwrap('lou_checkTable', 'number', ['string']),
	//readCharFromFile: Module.cwrap('lou_readCharFromFile'),

	free: Module.cwrap('lou_free'),
	charSize: Module.cwrap('lou_charSize', 'number'),
};
