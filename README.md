These are unoffical "javascript bindings" to liblouis created by cross
compiling [liblouis](https://github.com/liblouis/liblouis) using
[emscripten](http://emscripten.org/). Liblouis can be directly called
using the [`ccall`](https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#ccall) and 
[`cwrap`](https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#cwrap) functions or
by using the optional javascript API exposed by the file `easy_wrapper.js`.

[![npm version](https://badge.fury.io/js/liblouis-js.svg)](https://www.npmjs.com/package/liblouis-js)
[![Bower version](https://badge.fury.io/bo/liblouis-js.svg)](https://bower.io/search/?q=liblouis-js)

| File             | Filesize | Description                | Version\*                  |
|------------------|----------|----------------------------|--------------------------|
| `liblouis-tables-embeded.js`    | 29.8MB   | All tables embeded in file | commit db2a361 (> 3.0.0) |
| `liblouis-no-tables.js`    | 1.47MB   | Tables not included | commit db2a361 (> 3.0.0) |

\* shown is the commit's shortend hash of the liblouis version used to compile
the file. The comparison operator and version number are relative to the commit
tagged with the given version, e.g.  `> 3.0.0` is to be read as *newer than the
commit tagged as version 3.0.0*.

# API Overview

| Method           | Easy wrapper | Direct call |
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

# Usage Examples

### Printing the version number of liblouis using the API and the direct-call-API 
Include one of the `liblouis-*.js` files first. Afterwards you can optionally
include `easy_wrapper.js`.

```js
<!doctype html>

<script src="liblouis-tables-embeded.js"></script>
<script src="easy_wrapper.js"></script>

<script>
// Using easy_wrapper.js:
console.info("Liblouis Version:", liblouis.version());
// Should print:
// Liblouis Version: 3.0.0

// Using liblouis-(...).js directly:
console.info("Liblouis Version:", Module.ccall("lou_version", "string"));
// Should print:
// Liblouis Version: 3.0.0
</script>
```

### Translating and backtranslating a string using the javascript API
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

After including `liblouis-no-tables.js` and `easy_wrapper.js` call with an absolute or
relative URL to the table directory:

```js
// enable and set base url for tables
liblouis.enableOnDemandTableLoading("tables/");

// call any API (direct call or using the easy-wrapper) method:
var unicode_braille = liblouis.translateString("tables/unicode.dis,tables/de-de-g0.utb", "10 Ziegen")
// Makes 12 XHR-Requests for table files. The variable should contain the same
// content as above:
// ⠼⠁⠚ ⠵⠊⠑⠛⠑⠝
```

Note that you have to run liblouis in a worker thread for
`enableOnDemandTableLoading` to work.

### Debugging and Adjusting the log level

The available log levels are [listed in the liblouis
documentation](http://liblouis.org/documentation/liblouis.html#lou_005fsetLogLevel).
The log level constants can be accessed using `liblouis.LOG[levelname]`. The
default log level of liblouis is `liblouis.LOG.INFO`. The log messages of enabled
log levels are shown in the javascript console by default [1].

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

__Release 0.3.0:__ Initial public release

<hr>

__Footnotes__

[1] Liblouis writes messages to stdout and stderr by default. Emscripten
redirects these to `Module.print` and `Module.printErr`, which are implemented
as: `function print(x) { console.log(x); }` and `function printErr(x) {
console.warn(x); }`. There is no need to overwrite these functions. You can use
`liblouis#registerLogCallback(int logLevel, string msg)`, which additionally
exposes the log level.
