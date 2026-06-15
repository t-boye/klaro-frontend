import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg', 'icons/apple-touch-icon.svg'],
      manifest: {
        name: 'Klaro – Legal Document Explainer',
        short_name: 'Klaro',
        description: 'Understand any legal document in plain language. Built for Africans.',
        theme_color: '#1B4332',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['utilities', 'productivity'],
        icons: [
          { src: 'assets/logos/logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/logos/logo.png', sizes: '512x512', type: 'image/png' },
          { src: 'assets/logos/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon.svg',        sizes: 'any',     type: 'image/svg+xml' },
        ],
        screenshots: [
          { src: 'screenshot-mobile.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Klaro on mobile' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/.netlify/],
        runtimeCaching: [
          {
            // API calls — network only (always fresh)
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api') || url.pathname.startsWith('/.netlify'),
            handler: 'NetworkOnly',
          },
          {
            // PDF.js worker — cache first (large static asset)
            urlPattern: /pdf\.worker/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdfjs-worker',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // disable SW in dev to avoid caching issues
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api → Cloudflare Workers dev server (wrangler dev, port 8787)
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
