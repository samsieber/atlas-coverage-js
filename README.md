# atlas-coverage-js
A node module to run [atlas-coverage](https://github.com/samsieber/atlas-coverage) from node.

## Purpose

This tool allows you to take code coverage data on minified js from puppeteer 
and convert it into code coverage on the original source files by parsing and traversing
the source map files.

## How to Use

The implementation is pretty simple. This wrapper does two things:
1) Optionally downloads a copy of the atlas-coverage binary for you machine (architecture/platform)
2) Provides a javascript wrapper around the cli arguments.

### Initializing

You first have to initialize the atlas-coverage runner by telling it where to store and look for the 
platform specific binaries. That's the cache path.

```js
let cache_path = path.resolve(__dirname, '../tools');
require("atlas-coverage").initialize({cachePath}) // atlas-coverage will manage it's cached files in ../tools/atlas-bin
```

### Using

You'll need to generate a settings file for atlas coverage, once you've done that, you can call it thusly:
```js
atlas.run({
  configPath: configPath, // Where to find the configuration file
  outputPath: outputPath, // Where to write the output xml file
  inputFolder: inputPath, // Where to look for the puppeteer coverage .json files (not a recursive search)
})
```

## Example project

[atlas-coverage-js-demo](https://github.com/samsieber/atlas-coverage-js-demo) 
is an example project that shows how a demo angular project was converted to run e2e tests against the minified files,
and how atlas-coverage was integrated to get code coverage data out of it.
