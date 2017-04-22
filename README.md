These are "javascript bindings" to liblouis created by cross
compiling [liblouis](https://github.com/liblouis/liblouis) using
[emscripten](http://emscripten.org/). The Liblouis API written in C can be directly called
using the [`ccall`](https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#ccall) and 
[`cwrap`](https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#cwrap)
functions provided by emscripten. As directly calling the C API is cumbersome,
an additional API — called Easy API — is provided for most functions. This package
supports NodeJS and browser environments.

[![npm version](https://img.shields.io/npm/v/liblouis.svg?colorB=44cc11&label=Easy-API%20@npm)](https://www.npmjs.com/package/liblouis)
[![Bower version](https://img.shields.io/bower/v/liblouis.svg?colorB=44cc11&label=Easy-API%20@bower)](https://bower.io/search/?q=liblouis)
[![latest build in the npm registry](https://img.shields.io/npm/v/liblouis-build.svg?colorB=44cc11&label=Latest%20C-API%20Build%20@npm)](https://www.npmjs.com/package/liblouis-build)
[![latest build in the bower registry](https://img.shields.io/bower/v/liblouis-build.svg?colorB=44cc11&label=Latest%20C-API%20Build%20@bower)](https://bower.io/search/?q=liblouis-build)

[![build status of latest Easy-Api](https://img.shields.io/travis/liblouis/liblouis-js/master.svg?label=Build%20of%20Easy-API)](https://travis-ci.org/liblouis/liblouis-js)
[![build status of latest C-Api](https://img.shields.io/travis/liblouis/js-build.svg?branch=master&label=Build%20of%20C-API)](https://travis-ci.org/liblouis/liblouis-js)

---

<p align=center><strong>Table of Contents</strong></p>

1. [API Overview](#api-overview)
	1. [Installation](#installation)
	2. [List of Available Liblouis Functions](#list-of-available-liblouis-functions)
	3. [Compiling the Latest Version of Liblouis](#compiling-the-latest-version-of-liblouis)
2. [Usage Examples](#usage-examples)
	1. [Printing the Version Number Using the Easy API in the Browser](#printing-the-version-number-using-the-easy-api-in-the-browser)
	2. [Printing the Version Number By Directly Calling Liblouis in the Browser](#printing-the-version-number-by-directly-calling-liblouis-in-the-browser)
	3. [Printing the Version Number Using the Easy API in NodeJS](#printing-the-version-number-using-the-easy-api-in-nodejs)
	4. [Translating and Back-Translating a String Using the Easy API](#translating-and-back-translating-a-string-using-the-easy-api)
	5. [Altering a Table Definition on Run-Time](#altering-a-table-definition-on-run-time)
	6. [Downloading Table Files on Demand in the Browser](#downloading-table-files-on-demand-in-the-browser)
	7. [Loading Table Files From Disk in NodeJS](#loading-table-files-from-disk-in-nodejs)
	8. [Dropping the Path Prefix of Bundled Tables](#dropping-the-path-prefix-of-bundled-tables)
	9. [Debugging and Adjusting the Log Level](#debugging-and-adjusting-the-log-level)
	10. [Persisting Log Files in NodeJS using Deprecated Liblouis Log Functions](#persisting-log-files-in-nodejs-using-deprecated-liblouis-log-functions)
	11. [Usage with Typescript](#usage-with-typescript)
	12. [Switching between Builds](#switching-between-builds)
3. [Changelog](#changelog)
4. [Licensing](#licensing)

---

# API Overview

### Installation

#### With NPM

```
npm install liblouis
```

This will install the latest available stable release version of liblouis' C-API and is 
equivalent to an installation with:

```
npm install liblouis-build@latest
npm install liblouis
```

If you want to fetch a specific version of the C-API, for example version
`3.1.0`, you can use the following commands:

```
npm install liblouis-build@3.1.0
npm install liblouis
```

If you want to install the latest available development version of liblouis' C-API execute:

```
npm install liblouis/js-build
npm install liblouis
```

If you want to install a specific development version of liblouis' C-API, you can
specify the commit hash:

```
npm install liblouis/js-build#commit-4b4c025
npm install liblouis
```

You have to specify *exactly* 7 digits of the commit hash. Some commits won't
have a prebuilt binary available. In this case [you can build liblouis yourself](#compiling-the-latest-version-of-liblouis).

**Warning:** While the programatic interface of `liblouis-build` adheres to the
semantic versioning specification, table files do not. You should refrain from
adding `liblouis-build` as dependency with a version range if you are using
liblouis with custom table files.

### List of Available Liblouis Functions

| Method           | Easy API | Direct Call API |
|------------------|--------------|-------------|
| `lou_version` | ✔ | ✔ |
| `lou_translateString` | ✔\* | ✔ |
| `lou_translate` | ✖ | ✔ |
| `lou_backTranslateString` | ✔\* | ✔ |
| `lou_backTranslate` | ✖ | ✔ |
| `lou_hyphenate` | ✖ | ✔ |
| `lou_compileString` | ✔ | ✔ |
| `lou_getTypeformForEmphClass` | ✖ | ✔ |
| `lou_dotsToChar` | ✖ | ✔ |
| `lou_charToDots` | ✖ | ✔ |
| `lou_registerLogCallback` | ✔ | ✔ |
| `lou_setLogLevel` | ✔ | ✔ |
| `lou_logFile` | ✖\*\* | ✔ |
| `lou_logPrint` | ✖\*\* | ✔ |
| `lou_logEnd` | ✖\*\* | ✔ |
| `lou_setDataPath` | ✔ | ✔ |
| `lou_getDataPath` | ✔ | ✔ |
| `lou_getTable` | ✔ | ✔ |
| `lou_checkTable` | ✔ | ✔ |
| `lou_readCharFromFile` | ✖ | ✔ |
| `lou_free` | ✔ | ✔ |
| `lou_charSize` | ✔ | ✔ |

\* only [BMP](https://en.wikipedia.org/wiki/Plane_(Unicode)#Basic_Multilingual_Plane) tested

\*\* `lou_logPrint`, `lou_logFile` and `lou_logEnd` will not be implemented as
they are deprecated.

### Compiling the Latest Version of Liblouis

```shell
# obtain the latest version
git clone https://github.com/liblouis/liblouis.git
cd liblouis

# build
./autogen.sh
emconfigure ./configure --disable-shared
emmake make

emcc ./liblouis/.libs/liblouis.a -s RESERVED_FUNCTION_POINTERS=1 -s MODULARIZE=1\
	 -s EXPORT_NAME="'liblouisBuild'" -s EXTRA_EXPORTED_RUNTIME_METHODS="['FS',\
	'Runtime', 'stringToUTF16', 'Pointer_Stringify']" --pre-js ./liblouis-js/inc/pre.js\
	 --post-js ./liblouis-js/inc/post.js -o build-no-tables.js

cat ./inc/append.js >> build-no-tables.js
```

In liblouis versions prior to release 3.2.0, you have to list all exported API
functions:

```shell
emcc ./liblouis/.libs/liblouis.a -s RESERVED_FUNCTION_POINTERS=1 -s MODULARIZE=1\
	 -s EXPORTED_FUNCTIONS="['_lou_version', '_lou_translateString', '_lou_translate',\
	'_lou_backTranslateString', '_lou_backTranslate', '_lou_hyphenate',\
	'_lou_compileString', '_lou_getTypeformForEmphClass', '_lou_dotsToChar',\
	'_lou_charToDots', '_lou_registerLogCallback', '_lou_setLogLevel',\
	'_lou_logFile', '_lou_logPrint', '_lou_logEnd', '_lou_setDataPath',\
	'_lou_getDataPath', '_lou_getTable', '_lou_checkTable',\
	'_lou_readCharFromFile', '_lou_free', '_lou_charSize']"\
	 -s EXPORT_NAME="'liblouisBuild'" -s EXTRA_EXPORTED_RUNTIME_METHODS="['FS',\
	'Runtime', 'stringToUTF16', 'Pointer_Stringify']" --pre-js ./liblouis-js/inc/pre.js\
	 --post-js ./liblouis-js/inc/post.js -o build-no-tables.js
```

To include a list of table files or a directory containing table files use the [`--embed-file`
flag](https://kripken.github.io/emscripten-site/docs/porting/files/packaging_files.html#packaging-using-emcc).
For example, to embed all tables in a subfolder called `tables` add `--embed-file tables`, to embed
all tables in the virtual filesystem root add `--embed-file tables@/`.

If you build liblouis for 32-bit Unicode, execute configure with
`--enable-ucs4` and subsitute `stringToUTF16` with `stringToUTF32`.

# Usage Examples

### Printing the Version Number Using the Easy API in the Browser

Include a liblouis build first and the Easy-API second.

```js
<!doctype html>

<!-- use your package manager to obtain these files: `build-no-tables.js`
     is part of the package `liblouis-build`, `easy-api.js` is the main
     file of the `liblouis-js` package. -->

<script src="build-no-tables.js"></script>
<script src="easy-api.js"></script>

<script>
console.info("Liblouis Version:", liblouis.version());
// Should print:
// Liblouis Version: 3.1.0
</script>
```

### Printing the Version Number By Directly Calling Liblouis in the Browser

You can include any liblouis build for this example.

```js
<!doctype html>

<script src="build-no-tables.js"></script>

<script>
console.info("Liblouis Version:", liblouisBuild.ccall("lou_version", "string"));
// Should print:
// Liblouis Version: 3.1.0
</script>
```

### Printing the Version Number Using the Easy API in NodeJS

Using `require` includes the Easy API, liblouis without tables and mounts the
`tables` folder as `tables`.

```js
const liblouis = require("liblouis");

console.info("Liblouis Version using Easy API:", liblouis.version());
// Should print:
// Liblouis Version using Easy API: 3.1.0
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

### Altering a Table Definition on Run-Time

```js
console.log(liblouis.translateString("tables/unicode.dis,tables/de-de-g0.utb", "1"));
// Logs: ⠼⠁
liblouis.compileString("tables/unicode.dis,tables/de-de-g0.utb", "numsign 123456");
console.log(liblouis.translateString("tables/unicode.dis,tables/de-de-g0.utb", "1"));
// Logs: ⠿⠁
```

### Downloading Table Files on Demand in the Browser

After including a build without a bundled table folder and the Easy-API call
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

You should call `enableOnDemandTableLoading` only once on initialization.
Changing the table folder location during execution causes the filesystem to be
inconsistent. If you have to change the folder location, reload the whole
liblouis/emscripten instance.

### Loading Table Files from Disk in NodeJS

In NodeJS environments, `liblouis-js` automatically tries to load the `tables/`
folder from disk if your built does not already bundle table files.

If you do not want to load tables from disk, you can disable this feature
by calling:

```js
liblouis.disableOnDemandTableLoading();
```

Or if you want to change the location of the table folder, simply call:

```js
liblouis.enableOnDemandTableLoading(tableFolderPath);
```

Providing `null` will reset the path to the original folder location.
`enableOnDemandTableLoading` file not free tables that were already compiled by
liblouis automatically. You have to call `liblouis.free` yourself if you
want liblouis to reload table files.


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
### Persisting Log Files in NodeJS using Deprecated Liblouis Log Functions

The following example creates a log file, that is persisted on the hard drive.
Note that the functions of liblouis called below (`lou_logFile`, `lou_logPrint`
and `lou_logEnd`) are all deprecated. The example only demonstrates how
liblouis can be called directly from nodeJS. In production systems, you should
consider implementing your own log functionality using `registerLogCallback`.

```js
const path = require('path');
const capi = require('liblouis-build');
const easyapi = require('liblouis');
easyapi.setLiblouisBuild(capi);

// map a directory on the machine to a virtual directory of emscripten:
var hdd_directory = path.resolve(__dirname, 'logs/');

FS.mkdir('/logs');
liblouis.getFilesystem().mount(NODEFS, { root: hdd_directory }, '/logs');

// log all messages:
easyapi.setLogLevel(easyapi.LOG.ALL);

// enable liblouis' deprecated "log to file"-functionality:
capi.ccall('lou_logFile', 'void', ['string'], ['/logs/liblouis.txt']); 

// map the new log functionality of liblouis to the deprecated log
// functionality:
easyapi.registerLogCallback(function(i, str) {
	capi.ccall('lou_logPrint', 'void', ['string'], [str]);
});

// do something that logs messages:
easyapi.translateString("tables/unicode.dis,tables/de-de-g0.utb", "10 Ziegen");

// Example log file contents are now:
// ----------------------------------

// Performing translation: tableList=tables/unicode.dis,tables/de-de-g0.utb, inlen=38
// Inbuf=0x0031 0x0030 0x0020 0x005A 0x0069 0x0065 0x0067 0x0065 0x006E 0x0000
// 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000
// 0x0000 0x0033 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000
// 0x0000 0x0000 0x0000 0x0000 0x0000 0x0000 ~ 10 Ziegen
// Cannot resolve table 'tables/unicode.dis'
// 1 errors found.
// tables/unicode.dis,tables/de-de-g0.utb could not be found
```

The log file is created if it does not exist. If it exists, new log messages
are appended to the end of the file.

### Dropping the Path Prefix of Bundled Tables

`liblouis.enableOnDemandTableLoading` lets you set the location of the table
folder if you are not bundling tables in the build's binary. If you want to
change the folder location inside the bundled virtual filesystem, you can use
liblouis' `lou_setDataPath` as follows:

```js
const PREFIX = "/tables";

const capi = require('liblouis-build');
const easyapi = require('liblouis');
liblouis.setLiblouisBuild(capi);

capi.FS.mkdir("/liblouis");
capi.FS.symlink("/tables", "/liblouis/tables");
liblouis.setDataPath("/");
```

### Usage with Typescript

The easy api is typed and plays well with
[typescript](https://www.typescriptlang.org) and [npm](https://www.npmjs.com/).

Add the library as dependency to your `package.json` using

```
$ npm install --save liblouis
```

and add the following line to each file that uses liblouis

```js
/// <reference types="liblouis"/>
```

### Switching between Builds

Switching between builds is supported in nodeJS and the browser. The example
below uses nodeJS:

```js
const build_1 = require('liblouis-build/build-no-tables.js');
const build_2 = require('liblouis-build/build-tables-embeded.js');

// In nodeJS, liblouis-js uses 'build-no-tables' by default, which is
// included as build_1 above
const liblouis = require('liblouis');

// use a liblouis build with embeded tables instead:
liblouis.setLiblouisBuild(build_2);

// switch back to the default liblouis build
liblouis.setLiblouisBuild(build_1);
```

Settings like `registerLogCallback` are automatically applied to new build.

# Changelog

__Release 0.4.0:__ Removal of build switching `liblouis.setLiblouisBuild`
build in favor of multiple concurrent instances of the Easy-API. Introduction
of async Easy-API that automatically creates a worker thread; this allows
you to use on demand table loading effortlessly.

*This release is backward compatible:* Liblouis builds for previous versions
can be used with liblouis-js `0.4.0`.

__Release 0.3.0:__ `liblouis-js` no longer bundles a build of the liblouis
C-API [3]. Builds were moved to their own npm and bower packages - this makes
build switching and liblouis C-API selection easier; Adds support for on demand
table file loading in NodeJS; implements `lou_setDataPath` and `lou_getDataPath`.

*This release is backward compatible:* Liblouis builds for version `0.2.x` can
be used with liblouis-js `0.3.0`.


__Release 0.2.1:__ `liblouis-js` is now an official part of liblouis. The npm
and bower packages were renamed to `liblouis`. This release updates package
URLs from `reiner-dolp/liblouis-js` to `liblouis/liblouis-js`.

__Release 0.2.0:__ Adding support for nodeJS (Issue #10, #11) and commonJS;
Adding type definitions for Typescript; Updates liblouis to version `2c849bc`;
Renaming easy api file to `easy-api.js`; Implements `lou_compileString`; Support
for build switching; Emscripten methods are no longer leaked to global scope.


*This release is backward compatible:* Liblouis builds for version `0.1.0` can be
used with liblouis-js `0.2.0`.


__Release 0.1.0:__ Adding `libouis.setLogLevel` and `liblouis.registerLogCallback`;
updating liblouis builds to commit `db2a361`.

__Release 0.0.3:__ Initial public release

# Licensing

[Emscripten is available under 2
licenses](https://github.com/kripken/emscripten/blob/master/LICENSE), the MIT
license and the University of Illinois/NCSA Open Source License. [Liblouis is
licensed under
LGPLv2.1+](https://raw.githubusercontent.com/liblouis/liblouis/master/README).
Note that table files may have a different license. Licensing information can
be found in the header of the individual table files.

Code that is not part of liblouis and not part of emscripten is licensed under
GPL-3.0. The text of the license can be found in the file `LICENSE` of this
repository.

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

[3] Before this change, liblouis and liblouis-js versions correspond as follows:
`0.1.0 = 3.0.0 (db2a361)`, `0.2.0 = 3.1.0 (2c849bc)`.
