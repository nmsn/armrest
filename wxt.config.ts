import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  vite: () => ({
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  }),
  manifest: {
    name: 'Armrest Dashboard',
    description: 'Browser extension with custom new tab page',
    version: '1.0.0',
    action: {
      default_popup: 'popup/index.html',
      default_title: '打开面板'
    },
    chrome_url_overrides: {
      newtab: 'newtab.html'
    }
  },
});
