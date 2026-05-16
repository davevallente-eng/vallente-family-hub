// One-shot: resize + compress the public-folder images in place. Run once
// after dropping in a new logo or background.
//
//   node scripts/optimize-images.mjs
//
// The background is a photo, so we re-encode to JPEG (lossy, much smaller
// than PNG). The logo has flat colors/text on a white-ish background and
// renders fine as a quality-tuned PNG.

import sharp from 'sharp'
import { readFile, writeFile, stat, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '..', 'public')

const fmtKB = (b) => `${(b / 1024).toFixed(0)}KB`

async function processImage({ inFile, outFile, maxWidth, format, quality }) {
  const input = resolve(publicDir, inFile)
  if (!existsSync(input)) {
    console.log(`· ${inFile} not found, skipping`)
    return
  }
  const beforeBytes = (await stat(input)).size
  const buf = await readFile(input)
  const meta = await sharp(buf).metadata()
  const targetWidth = Math.min(meta.width, maxWidth)
  let pipeline = sharp(buf).resize({ width: targetWidth, withoutEnlargement: true })
  if (format === 'jpeg') {
    pipeline = pipeline.flatten({ background: '#000000' }).jpeg({ quality, mozjpeg: true })
  } else {
    pipeline = pipeline.png({ quality, compressionLevel: 9 })
  }
  const out = await pipeline.toBuffer()
  const outPath = resolve(publicDir, outFile)
  await writeFile(outPath, out)
  // Remove the input if the output is a different filename
  if (inFile !== outFile) await unlink(input)
  const pct = Math.round((1 - out.length / beforeBytes) * 100)
  console.log(`✓ ${inFile} → ${outFile}  ${meta.width}×${meta.height} → ${targetWidth}×? · ${fmtKB(beforeBytes)} → ${fmtKB(out.length)}  (-${pct}%)`)
}

await processImage({ inFile: 'bg.png',   outFile: 'bg.jpg',   maxWidth: 1920, format: 'jpeg', quality: 78 })
await processImage({ inFile: 'logo.png', outFile: 'logo.png', maxWidth: 800,  format: 'png',  quality: 85 })
