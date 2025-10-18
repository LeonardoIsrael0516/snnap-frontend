import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/microservice': {
        target: env.VITE_LINK_AI_API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/microservice/, ''),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurações para produção no Vercel
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: mode === 'production' ? 'terser' : 'esbuild',
     terserOptions: mode === 'production' ? {
       compress: {
        drop_console: true, // remove TODOS os console.*
        drop_debugger: true // remove debugger
      },
      mangle: true // ofusca nomes de variáveis e funções
     } : undefined,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          utils: ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Variáveis de ambiente - APENAS variáveis de ambiente (sem fallbacks hardcoded)
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      env.VITE_API_BASE_URL
    ),
    'import.meta.env.VITE_LINK_AI_API_URL': JSON.stringify(
      env.VITE_LINK_AI_API_URL
    ),
    'import.meta.env.VITE_PAYMENTS_API_URL': JSON.stringify(
      env.VITE_PAYMENTS_API_URL
    ),
    'import.meta.env.VITE_BIOLINK_API_URL': JSON.stringify(
      env.VITE_BIOLINK_API_URL
    ),
    'import.meta.env.VITE_EFI_PAYEE_CODE': JSON.stringify(
      env.VITE_EFI_PAYEE_CODE
    ),
    'import.meta.env.VITE_EFI_ACCOUNT_CODE': JSON.stringify(
      env.VITE_EFI_ACCOUNT_CODE
    ),
    'import.meta.env.VITE_EFI_SANDBOX': JSON.stringify(
      env.VITE_EFI_SANDBOX
    ),
    'import.meta.env.VITE_APP_URL': JSON.stringify(
      env.VITE_APP_URL
    ),
  },
  };
});
