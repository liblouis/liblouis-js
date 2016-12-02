These are unoffical "javascript bindings" to liblouis created by cross
compiling [liblouis](https://github.com/liblouis/liblouis) using
[emscripten](http://emscripten.org/). The official Liblouis API written in C can be directly called
using the [`ccall`](https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#ccall) and 
[`cwrap`](https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#cwrap)
functions provided by emscripten. As directly calling the C API is cumbersome,
an additional API — called Easy API — is provided for most functions.

[![npm version](https://badge.fury.io/js/liblouis-js.svg)](https://www.npmjs.com/package/liblouis-js)
[![Bower version](https://badge.fury.io/bo/liblouis-js.svg)](https://bower.io/search/?q=liblouis-js)

---

<p align=center><strong>Table of Contents</strong></p>

1. [API Overview](#api-overview)
	1. [List of Builds Contained in This Repository](#list-of-builds-contained-in-this-repository)
	2. [List of Available Liblouis Functions](#list-of-available-liblouis-functions)
	3. [Compiling the Latest Version of Liblouis](#compiling-the-latest-version-of-liblouis)
2. [Usage Examples](#usage-examples)
	1. [Printing the Version Number Using the Easy API](#printing-the-version-number-using-the-easy-api)
	2. [Printing the Version Number By Directly Calling Liblouis](#printing-the-version-number-by-directly-calling-liblouis)
	3. [Translating and Back-Translating a String Using the Easy API](#translating-and-back-translating-a-string-using-the-easy-api)
	4. [Downloading-Table-Files-on-Demand](#downloading-table-files-on-demand)
	5. [Debugging and Adjusting the Log Level](#debugging-and-adjusting-the-log-level)
3. [Changelog](#changelog)

---

# API Overview

###List of Builds Contained in this repository

| File             | Filesize | Description                | Version\*                  |
|------------------|----------|----------------------------|--------------------------|
| `liblouis-tables-embeded.js`    | 29.8MB   | All tables embeded in file | commit db2a361 (> 3.0.0) |
| `liblouis-no-tables.js`    | 1.47MB   | Tables not included | commit db2a361 (> 3.0.0) |

\* shown is the commit's shortend hash of the liblouis version used to compile
the file. The comparison operator and version number are relative to the commit
tagged with the given version, e.g.  `> 3.0.0` is to be read as *newer than the
commit tagged as version 3.0.0*.


###List of Available Liblouis Functions

| Method           | Easy API | Direct Call API |
|------------------|--------------|-------------|
| `lou_version` | ✔ | ✔ |
| `lou_translateString` | ✔* | ✔ |
| `lou_translate` | ✖ | ✔ |
| `lou_backTranslateString` | ✔* | ✔ |
| `lou_backTranslate` | ✖ | ✔ |
| `lou_hyphenate` | ✖ | ✔ |
| `lou_compileString` | ✖ | ✔ |
| `lou_getTypeformForEmphClass` | ✖ | ✔ |
| `lou_dotsToChar` | ✖ | ✔ |
| `lou_charToDots` | ✖ | ✔ |
| `lou_registerLogCallback` | ✔ | ✔ |
| `lou_setLogLevel` | ✔ | ✔ |
| `lou_logFile` | ✖ | ✔ |
| `lou_logPrint` | ✖ | ✔ |
| `lou_logEnd` | ✖ | ✔ |
| `lou_setDataPath` | ✖ | ✔ |
| `lou_getDataPath` | ✖ | ✔ |
| `lou_getTable` | ✔ | ✔ |
| `lou_checkTable` | ✔ | ✔ |
| `lou_readCharFromFile` | ✖ | ✔ |
| `lou_free` | ✔ | ✔ |
| `lou_charSize` | ✔ | ✔ |

<small>* only [BMP](https://en.wikipedia.org/wiki/Plane_(Unicode)#Basic_Multilingual_Plane) tested</small>

###Compiling the Latest Version of Liblouis

```
# obtain the latest version
git clone https://github.com/liblouis/liblouis.git
cd liblouis

# build
./autogen.sh
emconfigure ./configure
emmake make

emcc liblouis/.libs/liblouis.so -s RESERVED_FUNCTION_POINTERS=1 -s\
EXPORTED_FUNCTIONS="['_lou_version', '_lou_translateString', '_lou_translate',\
'_lou_backTranslateString', '_lou_backTranslate', '_lou_hyphenate',\
'_lou_compileString', '_lou_getTypeformForEmphClass', '_lou_dotsToChar',\
'_lou_charToDots', '_lou_registerLogCallback', '_lou_setLogLevel',\
'_lou_logFile', '_lou_logPrint', '_lou_logEnd', '_lou_setDataPath',\
'_lou_getDataPath', '_lou_getTable', '_lou_checkTable',\
'_lou_readCharFromFile', '_lou_free', '_lou_charSize']"  -o liblouis.js
```

To include a list of table files or a directory containing table files use the [`--embed-file`
flag](https://kripken.github.io/emscripten-site/docs/porting/files/packaging_files.html#packaging-using-emcc).

# Usage Examples

### Printing the Version Number Using the Easy API

Include one of the `liblouis-*.js` files first and `easy_wrapper.js` second.

```js
<!doctype html>

<script src="liblouis-no-tables.js"></script>
<script src="easy_wrapper.js"></script>

<script>
console.info("Liblouis Version:", liblouis.version());
// Should print:
// Liblouis Version: 3.0.0
</script>
```

### Printing the Version Number By Directly Calling Liblouis

Include one of the `liblouis-*.js` files.

```js
<!doctype html>

<script src="liblouis-no-tables.js"></script>

<script>
console.info("Liblouis Version:", Module.ccall("lou_version", "string"));
// Should print:
// Liblouis Version: 3.0.0
</script>
```

### Translating and Back-Translating a String Using the Easy API

```js
var unicode_braille = liblouis.translateString("tables/unicode.dis,tables/de-de-g0.utb", "10 Ziegen")
// Variable should contain:
// ⠼⠁⠚ ⠵⠊⠑⠛⠑⠝
console.log(liblouis.backTranslateString("tables/unicode.dis,tables/de-de-g0.utb", unicode_braille))
// Should print:
// 10 ziegen
```

<small>Note that the Unicode Braille Patterns in line 3 may not be
displayed in your browser or text editor.</small>

### Downloading Table Files on Demand

After including `liblouis-no-tables.js` and `easy_wrapper.js` call
`enableOnDemandTableLoading` with an absolute or relative URL to the table
directory:

```js
// enable and set base url for tables
liblouis.enableOnDemandTableLoading("tables/");

// call any API (direct call API or easy API) method:
var unicode_braille = liblouis.translateString("tables/unicode.dis,tables/de-de-g0.utb", "10 Ziegen")
// Makes 12 XHR-Requests for table files. The variable should contain the same
// content as above:
// ⠼⠁⠚ ⠵⠊⠑⠛⠑⠝
```

Note that you have to run liblouis in a worker thread for
`enableOnDemandTableLoading` to work [1].

### Debugging and Adjusting the Log Level

The available log levels are [listed in the liblouis
documentation](http://liblouis.org/documentation/liblouis.html#lou_005fsetLogLevel).
The log level constants can be accessed using `liblouis.LOG[levelname]`. The
default log level of liblouis is `liblouis.LOG.INFO`. The log messages of enabled
log levels are shown in the javascript console by default [2].

```js
// log everything including debug messages
liblouis.setLogLevel(liblouis.LOG.ALL);

// replace the default message handler
liblouis.registerLogCallback(function(logLevel, msg){
	// logLevel is the constant associated with the log level.
	// you may obtain a string representation of the log level as follows:
	var logLevelName = liblouis.LOG[logLevel];

	// you may check for a specific log level:
	if(logLevel === liblouis.LOG.DEBUG) {
		console.info("just recieved a debug message");
	}

	// or alternatively using a string comparison:
	if(logLevelName === "DEBUG") {
		console.info("just recieved a debug message");
	}

	console.log(logLevel, logLevelName, msg);
	// Example output:
	// 10000 "DEBUG" "found table tables/de-de-g1.ctb"
});

// remove the custom message handler and use the default message handler
liblouis.registerLogCallback(null);
```

# Changelog

__Release 0.1.0:__ Adding `libouis.setLogLevel` and `liblouis.registerLogCallback`;
updating liblouis builds to commit `db2a361`.

__Release 0.0.3:__ Initial public release

<hr>

__Footnotes__

[1] Emscripten requires the files to be loaded synchroniously. Synchronous XHR,
used to fetch the files, is deprecated in the main thread as it blocks all
user interaction.
 
[2] Liblouis writes messages to stdout and stderr by default. Emscripten
redirects these to `Module.print` and `Module.printErr`, which are implemented
as: `function print(x) { console.log(x); }` and `function printErr(x) {
console.warn(x); }`. There is no need to overwrite these functions. You can use
`liblouis#registerLogCallback(int logLevel, string msg)`, which additionally
exposes the log level. The Easy API registers a log callback by default, which
maps each message level to the correct `console` method, e.g. liblouis warning
messages to `console.warn` and liblouis fatal errors to `console.error`.
