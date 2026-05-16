// Generate the PWA icons referenced in vite.config.js manifest. These are
// what iOS / Android show on the home screen when the user installs the
// app. Simple branded mark — accent blue square with a white "V".
//
//   node scripts/generate-icons.mjs

import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '..', 'public')

const ACCENT = '#378ADD'

function iconSvg(size) {
  const radius = Math.round(size * 0.18)
  const fontSize = Math.round(size * 0.62)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${ACCENT}"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
      font-family="-apple-system, system-ui, 'Segoe UI', Roboto, sans-serif"
      font-size="${fontSize}" font-weight="600" fill="#FFFFFF">V</text>
  </svg>`
}

const SIZES = [192, 512]
for (const size of SIZES) {
  const svg = iconSvg(size)
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  const out = resolve(publicDir, `icon-${size}.png`)
  await writeFile(out, buf)
  console.log(`✓ icon-${size}.png  (${buf.length} bytes)`)
}

// Apple touch icon (180px) — used by iOS when the user adds to home screen
// from Safari without a manifest install prompt.
const appleSvg = iconSvg(180)
const appleBuf = await sharp(Buffer.from(appleSvg)).png().toBuffer()
await writeFile(resolve(publicDir, 'apple-touch-icon.png'), appleBuf)
console.log(`✓ apple-touch-icon.png  (${appleBuf.length} bytes)`)
