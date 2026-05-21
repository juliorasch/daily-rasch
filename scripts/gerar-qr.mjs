// Gerador do QR code para o cartão de visita físico da Rasch Remodeling.
//
// O QR aponta para a página pública do cartão digital (/cartao).
// Uso:
//   npm run cartao:qr                       — usa o URL por defeito
//   npm run cartao:qr -- https://rasch.pt   — usa o URL indicado
//
// Resultado:
//   public/cartao-qr.svg  — vectorial, ideal para impressão (escala infinita)
//   public/cartao-qr.png  — 1200px, para ferramentas que precisem de raster

import QRCode from 'qrcode'
import { mkdir, writeFile } from 'node:fs/promises'

const URL_DEFEITO = 'https://rasch.pt/cartao'
const url = process.argv[2] ?? URL_DEFEITO

// Cores de marca — escuro sobre branco garante leitura fiável em qualquer
// scanner. Colocar o QR sobre uma zona branca do cartão.
const cor = { dark: '#0E1F1D', light: '#FFFFFF' }

const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: cor,
})
await mkdir('public', { recursive: true })
await writeFile('public/cartao-qr.svg', svg)

await QRCode.toFile('public/cartao-qr.png', url, {
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 1200,
  color: cor,
})

console.log(`QR code gerado para: ${url}`)
console.log('  -> public/cartao-qr.svg (vectorial, para impressao)')
console.log('  -> public/cartao-qr.png (1200px)')
