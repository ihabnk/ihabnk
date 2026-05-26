import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ihabnk.org',
  vite: {
    plugins: [tailwindcss()],
  },
});
