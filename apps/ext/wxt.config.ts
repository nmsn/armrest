import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  runner: {
    startUrls: ['https://www.baidu.com'],
  },
  manifest: {
    name: 'Armrest',
    description: 'Browser extension with custom new tab page',
    version: '1.0.0',
    icons: {
      16: 'icon_16.png',
      32: 'icon_32.png',
      48: 'icon_48.png',
      128: 'icon_128.png',
    },
    action: {
      default_popup: 'popup/index.html',
      default_title: '打开面板',
      default_icon: {
        16: 'icon_16.png',
        32: 'icon_32.png',
        48: 'icon_48.png',
        128: 'icon_128.png',
      },
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
