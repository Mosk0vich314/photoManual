// Verify the built PWA registers a service worker and works offline.
import puppeteer from 'puppeteer-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:4173/'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844 })

await page.goto(URL, { waitUntil: 'load' })
// wait for SW to take control + cache
await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.ready, { timeout: 15000 })
await new Promise((r) => setTimeout(r, 2500))
const reg = await page.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration()
  return { active: !!r?.active, scope: r?.scope }
})
console.log('SW active:', reg.active, 'scope:', reg.scope)

// go OFFLINE and reload — must still render from cache
await page.setOfflineMode(true)
await page.reload({ waitUntil: 'load' })
await new Promise((r) => setTimeout(r, 1500))
const offline = await page.evaluate(() => ({
  online: navigator.onLine,
  hasTiles: !!document.querySelector('.tiles'),
  title: document.querySelector('.hero h1')?.textContent || '(none)',
}))
console.log('OFFLINE reload -> navigator.onLine:', offline.online, '| tiles rendered:', offline.hasTiles, '| hero:', offline.title)

// also check an offline deep route (hash) renders
await page.goto(URL + '#/look', { waitUntil: 'load' })
await new Promise((r) => setTimeout(r, 1200))
const gallery = await page.evaluate(() => document.querySelectorAll('.scard').length)
console.log('OFFLINE /look -> style cards:', gallery)

await browser.close()
console.log(reg.active && offline.hasTiles && gallery > 0 ? 'PASS: works offline' : 'FAIL')
