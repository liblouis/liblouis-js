These are unoffical "javascript bindings" to liblouis created by cross
compiling [liblouis](https://github.com/liblouis/liblouis) using
[emscripten](http://emscripten.org/).

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
