import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://aunamilladetudestino.com/wp-content/uploads/2026/04/'

const FILES = [
  { id: 'iberia_icon', file: 'tarjeta-iberia-icon-visa-iberia-plus.png' },
  { id: 'iberia_icon_aire', file: '1000054388.png' },
  { id: 'iberia_zenit_gold', file: '1000054389.png' },
  { id: 'revolut', file: '1000054390.jpg' },
  { id: 'amex_platinum', file: '1000054391.png' },
  { id: 'amex_gold', file: '1000054392.jpg' },
  { id: 'air_europa_bankinter', file: 'tarjeta-air-europa-bankinter-1024x652.jpg' },
  { id: 'vueling_up', file: '1000054394.png' },
  { id: 'miles_and_more_caixabank', file: '1000054395.png' },
]

const outDir = path.join(process.cwd(), 'public', 'cards')
await mkdir(outDir, { recursive: true })

for (const { id, file } of FILES) {
  const ext = path.extname(file)
  const dest = path.join(outDir, `${id}${ext}`)
  const url = `${BASE}${file}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(dest, buf)
  console.log(`Wrote ${dest} (${buf.length} bytes)`)
}
