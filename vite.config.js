import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base: './' so the built app works from any path (file://, GitHub Pages subfolder, etc.)
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      workbox: {
        // precache the whole static app so it works fully offline on a shoot
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,xmp}'],
        // the .xmp profiles are ~230 KB each; lift the default 2 MiB cap
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'Manuale di Fotografia & Color Grading',
        short_name: 'Manuale',
        description: '24 look cinematografici, teoria e ricette interattive — offline.',
        lang: 'it',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0c0f',
        theme_color: '#0b0c0f',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
