import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  return {
    envDir: __dirname,
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/selsyn': {
          target: 'https://api.appselsyn.com.br/keek/rest',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/selsyn/, '')
        }
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React ecosystem
            'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-is'],
            // Supabase
            'vendor-supabase': ['@supabase/supabase-js'],
            // Charts e visualização
            'vendor-charts': ['recharts'],
            // Mapas
            'vendor-maps': ['leaflet', 'react-leaflet'],
            // Utilitários
            'vendor-utils': ['axios', 'papaparse', 'xlsx', 'jspdf', 'jspdf-autotable'],
            // AI e processamento
            'vendor-ai': ['@google/generative-ai', 'tesseract.js'],
            // Query
            'vendor-query': ['@tanstack/react-query'],
            // UI
            'vendor-ui': ['lucide-react']
          }
        }
      },
      chunkSizeWarningLimit: 500,
      sourcemap: false, // Desabilitar sourcemaps em produção
    }
  };
});
