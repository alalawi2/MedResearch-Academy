import { defineConfig, type ViteDevServer, type PreviewServer } from 'vite';
import react from '@vitejs/plugin-react';

// Match the static-page rewrites used by Vercel before its SPA fallback.
function wardwisePages(server: ViteDevServer | PreviewServer) {
  const pages = new Set([
    '/solutions/wardwise',
    '/solutions/wardwise/privacy',
    '/solutions/wardwise/support',
    '/solutions/wardwise/guides/handover-english',
    '/solutions/wardwise/guides/clarifying-instructions',
  ]);
  server.middlewares.use((req, _res, next) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (pages.has(url.pathname)) req.url = `${url.pathname}/index.html${url.search}`;
    next();
  });
}

export default defineConfig({
  plugins: [react(), {
    name: 'wardwise-static-pages',
    configureServer: wardwisePages,
    configurePreviewServer: wardwisePages,
  }],
  build: { outDir: 'dist' },
});
