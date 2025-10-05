import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://username.github.io',
  base: '/ml-engineer-portfolio',
  output: 'static',
  build: {
    assets: 'assets'
  }
});