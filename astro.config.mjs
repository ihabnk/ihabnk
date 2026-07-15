import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://ihabnk.org',

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    // `headingAttributes` enables `## Heading {#custom-id}` in markdown, so
    // the review TOCs' short anchors (#tldr, #setup, …) resolve.
    processor: satteri({ features: { headingAttributes: true } }),
  },

  integrations: [react()],
});
