/**
 * Minimal reproduction for https://github.com/tensorflow/tfjs/issues/8612
 *
 * Issue: @tensorflow/tfjs-tfdf dist files contain __dirname and __filename
 * which are CommonJS globals not available in ESM modules.
 *
 * Run:
 *   npm install
 *   npm start
 *
 * The problematic code is in the emscripten-generated wasm loader.
 * This reproduction demonstrates that the code contains __dirname references.
 */

import * as tfdf from '@tensorflow/tfjs-tfdf'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('tfdf module imported successfully:', Object.keys(tfdf))
console.log('')

// Demonstrate the problematic code by reading the dist file
const fesmPath = join(__dirname, 'node_modules/@tensorflow/tfjs-tfdf/dist/tf-tfdf.fesm.js')
const content = readFileSync(fesmPath, 'utf-8')

// Find __dirname usage in the bundle
const dirnameMatches = content.match(/\b__dirname\b/g) || []
const filenameMatches = content.match(/\b__filename\b/g) || []

console.log(`Found ${dirnameMatches.length} occurrences of __dirname`)
console.log(`Found ${filenameMatches.length} occurrences of __filename`)
console.log('')

// Show the context where __dirname is used
const contextMatch = content.match(/.{50}__dirname.{50}/)
if (contextMatch) {
  console.log('Context of __dirname usage (emscripten wasm loader):')
  console.log(`  ...${contextMatch[0]}...`)
}
console.log('')

console.log('In strict ESM environments (e.g., with bundlers that enforce ESM),')
console.log('these __dirname/__filename references will cause:')
console.log('  ReferenceError: __dirname is not defined')
console.log('')
console.log('Note: Node.js ESM may shim these globals in some cases, but')
console.log('bundlers like Vite, esbuild, or webpack in ESM mode will fail.')
