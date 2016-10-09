These are unoffical "javascript bindings" to liblouis created by cross
compiling [liblouis](https://github.com/liblouis/liblouis) using
[emscripten](http://emscripten.org/).

| File             | Filesize | Description                | Version                  |
|------------------|----------|----------------------------|--------------------------|
| `liblouis.js`    | 29.8MB   | All tables embeded in file | commit 7e363d0 (> 3.0.0) |
| `liblouis-no-tables.js`    | 1.47MB   | Tables not included | commit 7e363d0 (> 3.0.0) |

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
| `lou_registerLogCallback` | ✖ | ✔ |
| `lou_setLogLevel` | ✖ | ✔ |
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
```js
// Using easy_wrapper.js:
console.info("Liblouis Version:", liblouis.version());
// Should print:
// Liblouis Version: 3.0.0

// Using liblouis.js directly:
console.info("Liblouis Version:", Module.ccall("lou_version", "string"));
// Should print:
// Liblouis Version: 3.0.0
```

```js
var unicode_braille = liblouis.translateString("tables/unicode.dis,tables/de-de-g0.utb", "10 Ziegen")
// Variable should contain:
// ⠼⠁⠚ ⠵⠊⠑⠛⠑⠝
console.log(liblouis.backTranslateString("tables/unicode.dis,tables/de-de-g0.utb", unicode_braille))
// Should print:
// 10 ziegen
```

Note that the Unicode Braille Patterns in line 3 of example 2 may not be
displayed in your browser or text editor.
