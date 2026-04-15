import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  manifest: {
    name: 'Armrest',
    description: 'Browser extension with custom new tab page',
    version: '1.0.0',
    action: {
      default_popup: 'popup/index.html',
      default_title: '打开面板'
    },
    chrome_url_overrides: {
      newtab: 'newtab.html'
    },
    permissions: [
      'storage',
      'tabs',
      'geolocation'
    ]
  },
  alias: {
    '@': path.resolve(__dirname),
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
