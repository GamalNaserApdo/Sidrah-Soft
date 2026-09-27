import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(env.VITE_API_BASE_URL || '');

  if (command === 'build' && isLocalApiUrl && env.VITE_ALLOW_LOCAL_API !== 'true') {
    throw new Error(
      'Production builds cannot target localhost. Use VITE_ALLOW_LOCAL_API=true only for an explicitly local-only artifact.',
    );
  }

  return {
    plugins: [react()],
    // Use 'localhost' (not 'true') so the dev/preview origin matches
    // VITE_API_BASE_URL (http://localhost:8002). Otherwise cookies set by
    // the backend are scoped to a different host and Django's CSRF
    // middleware sees no cookie when the browser is opened via 127.0.0.1
    // or a LAN IP address.
    server: {
      port: 5174,
      host: 'localhost',
    },
    preview: {
      port: 5177,
      host: 'localhost',
      proxy: {
        '/api': 'http://localhost:8002',
        '/media': 'http://localhost:8002',
      },
    },
  };
});
