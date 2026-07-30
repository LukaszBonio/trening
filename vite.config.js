import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))
let commit = 'unknown'
try { commit = execSync('git rev-parse --short HEAD').toString().trim() } catch {}

export default defineConfig({
  // GitHub Pages serwuje pod /trening/ — przy lokalnym dev Vite ignoruje base
  base: process.env.GITHUB_ACTIONS ? '/trening/' : './',
  // Wersja + commit wstrzykiwane do buildu — dołączane do zgłoszeń bugów (kontekst).
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(commit)
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // skipWaiting: nowy SW od razu staje się aktywny zamiast czekać na zamknięcie wszystkich kart.
      // clientsClaim: nowy SW przejmuje kontrolę nad otwartymi klientami od razu po aktywacji.
      // Bez tego user mógłby utknąć na starej wersji do pełnego restartu PWA.
      injectRegister: 'auto',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'Trening Pro',
        short_name: 'Trening Pro',
        description: 'Trening siłowy: Push/Pull/Legs + Upper/Lower + FBW',
        theme_color: '#0a0a0b',
        background_color: '#08090d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // Ciężkie biblioteki eksportu PDF (jspdf + html2canvas, ~580 KB) NIE trafiają do
        // precache — ładują się runtime na żądanie (reguła niżej). Reszta (Supabase,
        // DOMPurify) zostaje w precache, bo jest potrzebna do bootu/Coacha offline.
        globIgnores: ['**/jspdf*.js', '**/html2canvas*.js'],
        ignoreURLParametersMatching: [/.*/],
        runtimeCaching: [
          {
            // PDF: cache po pierwszym (online) eksporcie → offline działa potem.
            urlPattern: ({ url }) => /jspdf|html2canvas/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-libs',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 90 }
            }
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.endsWith('.supabase.co') ||
              url.hostname.endsWith('.supabase.in') ||
              url.hostname === 'api.anthropic.com' ||
              url.hostname.endsWith('.workers.dev'),
            handler: 'NetworkOnly'
          },
          {
            urlPattern: ({ url }) =>
              url.hostname === 'fonts.googleapis.com' ||
              url.hostname === 'fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: ({ url }) => url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'cdnjs.cloudflare.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-libs',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 90 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    open: false
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
    globals: true
  }
})
