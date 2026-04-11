// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/shadowspeaklaunch/',
  plugins: [
    react(),
    {
      name: 'inject-csp',
      transformIndexHtml(html, ctx) {
        if (!ctx.server) {
          return html.replace(
            '<!-- CSP is injected by Vite in production builds via vite.config.js -->',
            `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://apis.google.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://shadowspeak-api.faith-lantz-ee8.workers.dev https://cantonese.ai/api/text-to-jyutping https://*.firebaseapp.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src https://*.firebaseapp.com https://accounts.google.com; media-src 'self' blob:; img-src 'self' data: blob: https://*.googleusercontent.com; font-src 'self';" />`
          );
        }
        return html;
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://shadowspeak-api.faith-lantz-ee8.workers.dev' && url.pathname.startsWith('/tts'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'shadowspeak-audio-v2',
              expiration: { maxEntries: 1000, maxAgeSeconds: 90 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'ShadowSpeak — Learn to Speak Cantonese',
        short_name: 'ShadowSpeak',
        description: 'Audio-first Cantonese learning through shadowing',
        theme_color: '#1A2A18',
        background_color: '#F7F4EC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/shadowspeaklaunch/',
        start_url: '/shadowspeaklaunch/',
        categories: ['education'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          storage: ['idb'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
