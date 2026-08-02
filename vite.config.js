import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function heroPreloadPlugin() {
  return {
    name: 'hero-preload',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      const assets = Object.values(ctx.bundle);
      const desktopAvif = assets.find(a => a.name === 'hero-digital-sidrah-desktop.avif');
      const mobileAvif = assets.find(a => a.name === 'hero-digital-sidrah-mobile.avif');
      if (!desktopAvif || !mobileAvif) return html;

      const preloadTags = [
        `<link rel="preload" as="image" type="image/avif" href="/${desktopAvif.fileName}" media="(min-width: 768px)" fetchpriority="high" />`,
        `<link rel="preload" as="image" type="image/avif" href="/${mobileAvif.fileName}" media="(max-width: 767px)" fetchpriority="high" />`,
      ].join('\n    ');

      return html.replace('</title>', `</title>\n    ${preloadTags}`);
    }
  };
}

export default defineConfig({
  plugins: [react(), heroPreloadPlugin()],
  server: {
    port: 5174,
    host: true
  }
});
