import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'],
      manifest: {
        name: 'المهندس - حاسبة المساحة الهندسية',
        short_name: 'المهندس',
        description: 'حاسبة المساحة الهندسية المتكاملة - أدوات هندسية احترافية',
        theme_color: '#007aff',
        background_color: '#f2f2f7',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ar',
        orientation: 'portrait',
        icons: [
          { src: 'icon.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});
