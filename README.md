# tfjs-tfdf ESM Reproduction

Minimal reproduction for [tensorflow/tfjs#8612](https://github.com/tensorflow/tfjs/issues/8612).

## Issue

`@tensorflow/tfjs-tfdf` uses `__dirname` and `__filename` in its distributed code. These CommonJS globals are not available in ESM modules (when `"type": "module"` is set in package.json).

The problematic code is in the emscripten-generated wasm loader bundled in `dist/inference_bundle.js`:

```javascript
// From inference_bundle.js - emscripten wasm loader code
p?(T?k=require("path").dirname(k)+"/":k=__dirname+"/", ...
```

This code path is triggered when the wasm module needs to locate the `.wasm` file.

## Steps to Reproduce

```bash
npm install
npm start
```

## Expected

The module should load successfully and initialize the wasm inference engine.

## Actual

When the wasm loader tries to determine the base path, it fails with:

```
ReferenceError: __dirname is not defined
```

## Files with `__dirname`

```bash
$ grep -o '\b__dirname\b' node_modules/@tensorflow/tfjs-tfdf/dist/*.js | wc -l
8  # present in all bundle variants
```

## Environment

- Node.js: v20+ (any version with ESM support)
- Package: `@tensorflow/tfjs-tfdf@0.0.1-alpha.29`

## Proposed Fix

The emscripten-generated code should be patched to use ESM-compatible alternatives:

```javascript
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

This requires changes to the build process that generates the wasm loader.
