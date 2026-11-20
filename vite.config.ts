import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// PWA (manifest + service worker) is opt-in via VITE_PWA=true: it is needed
// for the deployed GitHub Pages build, but must not break local `vite build` —
// workbox-build writes unquoted absolute import paths, which fails when the
// project path contains an apostrophe (e.g. `l'emploi-des-fourmis`).
const pwa: PluginOption =
  process.env.VITE_PWA === 'true'
    ? VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        includeAssets: ['logo.svg'],
        manifest: {
          name: "L'Emploi des Fourmis",
          short_name: 'Fourmis',
          description: 'Suis tes candidatures comme une fourmi travailleuse.',
          lang: 'fr',
          theme_color: '#166534',
          background_color: '#f0fdf4',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '.',
          scope: '.',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,json,webmanifest}'],
          navigateFallback: 'index.html',
        },
      })
    : []

export default defineConfig({
  plugins: [react(), tailwindcss(), pwa],
})
