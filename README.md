These are unoffical "javascript bindings" to liblouis created by cross
compiling [liblouis](https://github.com/liblouis/liblouis) using
[emscripten](http://emscripten.org/).

| File             | Filesize | Description                | Version                  |
|------------------|----------|----------------------------|--------------------------|
| `liblouis.js`    | 29.8MB   | All tables embeded in file | commit 62e7cbf (> 3.0.0) |

# API Overview

| Method           | Easy wrapper | Direct call |
|------------------|--------------|-------------|
| `_lou_version` | ✔ | ✔ |
| `_lou_translateString` | ✔* | ✔ |
| `_lou_translate` | ✖ | ✔ |
| `_lou_backTranslateString` | ✔* | ✔ |
| `_lou_backTranslate` | ✖ | ✔ |
| `_lou_hyphenate` | ✖ | ✔ |
| `_lou_compileString` | ✖ | ✔ |
| `_lou_getTypeformForEmphClass` | ✖ | ✔ |
| `_lou_dotsToChar` | ✖ | ✔ |
| `_lou_charToDots` | ✖ | ✔ |
| `_lou_registerLogCallback` | ✖ | ✔ |
| `_lou_setLogLevel` | ✖ | ✔ |
| `_lou_logFile` | ✖ | ✔ |
| `_lou_logPrint` | ✖ | ✔ |
| `_lou_logEnd` | ✖ | ✔ |
| `_lou_setDataPath` | ✖ | ✔ |
| `_lou_getDataPath` | ✖ | ✔ |
| `_lou_getTable` | ✔ | ✔ |
| `_lou_checkTable` | ✔ | ✔ |
| `_lou_readCharFromFile` | ✖ | ✔ |
| `_lou_free` | ✔ | ✔ |
| `_lou_charSize` | ✖ | ✖ |

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
