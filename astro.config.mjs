// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://atlas.sciona.dev',

  integrations: [mdx(), react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});