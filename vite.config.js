import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'privacy.html'],
      manifest: {
        name: 'Jejak — Kepelatihan Olahraga',
        short_name: 'Jejak',
        description:
          'Kalkulator kepelatihan olahraga & program latihan personal: VO2 maks, zona detak jantung, komposisi tubuh, program latihan otomatis, target nutrisi.',
        start_url: '/',
        display: 'standalone',
        background_color: '#EEF1EA',
        theme_color: '#10233B',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        // Semua aset app-shell (HTML/CSS/JS) di-cache otomatis saat build.
        // Karena semua kalkulator berjalan di perangkat (tanpa panggilan API),
        // seluruh aplikasi tetap berfungsi penuh walau offline setelah
        // kunjungan pertama.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
