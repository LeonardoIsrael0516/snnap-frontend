// Debug utility para verificar variáveis de ambiente
export function debugEnvVars() {
  const envVars = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_LINK_AI_API_URL: import.meta.env.VITE_LINK_AI_API_URL,
    VITE_PAYMENTS_API_URL: import.meta.env.VITE_PAYMENTS_API_URL,
    VITE_BIOLINK_API_URL: import.meta.env.VITE_BIOLINK_API_URL,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };
  
  console.log('🔍 Environment Variables Debug:', envVars);
  return envVars;
}

// Função para verificar se as URLs estão corretas
export function validateApiUrls() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiBaseUrl) {
    console.error('❌ VITE_API_BASE_URL não está definida!');
    return false;
  }
  
  if (apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1')) {
    console.warn('⚠️  VITE_API_BASE_URL está apontando para localhost em produção!');
    return false;
  }
  
  if (apiBaseUrl.includes('snnap-frontend.onrender.com')) {
    console.error('❌ VITE_API_BASE_URL está apontando para o frontend em vez do backend!');
    return false;
  }
  
  console.log('✅ VITE_API_BASE_URL está correta:', apiBaseUrl);
  return true;
}









