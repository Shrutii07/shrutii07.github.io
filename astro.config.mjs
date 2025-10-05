import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://shrutii07.github.io',
  output: 'static',
  build: {
    assets: 'assets'
  }
});