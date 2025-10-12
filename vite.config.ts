import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://snnap-backend.onrender.com/api',
        changeOrigin: true,
        secure: false,
      },
      '/microservice': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/microservice/, ''),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurações para produção no Vercel
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  // Variáveis de ambiente para produção
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://snnap-backend.onrender.com/api'
        : 'http://localhost:3001/api'
    ),
    'import.meta.env.VITE_LINK_AI_API_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://snnap-link-ai.onrender.com/api'
        : 'http://localhost:3002/api'
    ),
    'import.meta.env.VITE_PAYMENTS_API_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://snnap-payments.onrender.com/api'
        : 'http://localhost:3004/api'
    ),
    'import.meta.env.VITE_BIOLINK_API_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://snnap.com/api'
        : 'http://localhost:3003/api'
    ),
    'import.meta.env.VITE_EFI_PAYEE_CODE': JSON.stringify(
      mode === 'production'
        ? 'your-efi-payee-code'
        : 'test_payee_code'
    ),
  },
}));
