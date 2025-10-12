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
        target: 'http://localhost:3001',
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
         define: {
           'import.meta.env.VITE_PAYMENTS_API_URL': JSON.stringify(
             mode === 'production' 
               ? 'https://payments.seudominio.com/api'
               : 'http://localhost:3004/api'
           ),
           'import.meta.env.VITE_EFI_PAYEE_CODE': JSON.stringify(
             mode === 'production'
               ? 'seu_payee_code_producao'
               : 'test_payee_code'
           ),
         },
}));
