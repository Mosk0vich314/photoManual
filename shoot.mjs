// Mobile screenshots via puppeteer-core driving the installed Chrome.
// Usage: node shoot.mjs <route> <outname>
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'fs'
mkdirSync('_shots', { recursive: true })

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5173/#'

const routes = process.argv[2]
  ? [[process.argv[2], process.argv[3] || 'shot']]
  : [
      ['/', 'm-home'],
      ['/look', 'm-look'],
      ['/look/stile-4-look-cyberpunk', 'm-detail'],
      ['/scena', 'm-scena'],
      ['/capitolo/teoria-del-colore', 'm-colore'],
      ['/cerca', 'm-cerca'],
    ]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

for (const [route, name] of routes) {
  await page.goto(BASE + route, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 500))
  await page.screenshot({ path: `_shots/${name}.png` })
  const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  console.log(`${name}: scrollWidth=${w.sw} innerWidth=${w.iw} ${w.sw > w.iw ? 'OVERFLOW!' : 'ok'}`)
}

// extra: search with a typed query
if (!process.argv[2]) {
  await page.goto(BASE + '/cerca', { waitUntil: 'networkidle0' })
  await page.type('input', 'curva')
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: '_shots/m-cerca-q.png' })
  console.log('m-cerca-q: done')

  // extra: scheda rapida (scroll to bottom of a style)
  await page.goto(BASE + '/look/stile-1-look-tarkovskij-freddo', { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('.scheda')][0]
    if (el) el.scrollIntoView({ block: 'center' })
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: '_shots/m-scheda.png' })
  console.log('m-scheda: done')
}
await browser.close()
