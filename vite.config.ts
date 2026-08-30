import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/auth': {
          target: env.VITE_BASE_URL ? env.VITE_BASE_URL.replace('/public/v1', '/auth') : 'http://localhost:3000/api/auth',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/auth/, ''),
        },
        '/api': {
          target: env.VITE_BASE_URL || 'http://localhost:3000/api/public/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'x-api-key': env.VITE_CATALOGUE_API_KEY || 'mk_1df522735447ffab48604db037bd4cd8bf566bc1991acf31a55deffc19a93c8a'
          }
        }
      }
    },
  };
});
