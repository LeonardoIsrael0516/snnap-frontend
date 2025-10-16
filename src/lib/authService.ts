// Em desenvolvimento, usar proxy do Vite (/api)
// Em produção, usar URL completa
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // em segundos
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
}

let refreshTokenPromise: Promise<boolean> | null = null;

/**
 * Salva os tokens no localStorage
 */
export function saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // Calcular timestamp de expiração
  const expiresAt = Date.now() + (expiresIn * 1000);
  localStorage.setItem('tokenExpiresAt', expiresAt.toString());
}

/**
 * Obtém o access token do localStorage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Obtém o refresh token do localStorage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

/**
 * Verifica se o token está próximo de expirar (< 1 dia)
 */
export function isTokenExpiringSoon(): boolean {
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!expiresAt) return true;
  
  const expiresAtTimestamp = parseInt(expiresAt, 10);
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000; // 1 dia antes de expirar
  
  return (expiresAtTimestamp - now) < oneDayInMs;
}

/**
 * Verifica se o token está expirado
 */
export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!expiresAt) return true;
  
  const expiresAtTimestamp = parseInt(expiresAt, 10);
  return Date.now() >= expiresAtTimestamp;
}

/**
 * Renova o access token usando o refresh token
 */
export async function refreshAccessToken(): Promise<boolean> {
  // Se já há uma renovação em andamento, retornar a mesma promise
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        console.error('❌ Refresh token não encontrado');
        logout();
        return false;
      }

      console.log('🔄 Renovando access token...');

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('❌ Erro ao renovar token:', response.statusText);
        logout();
        return false;
      }

      const data: TokenData = await response.json();
      
      // Salvar novos tokens
      saveTokens(data.accessToken, data.refreshToken, data.expiresIn);
      
      console.log('✅ Token renovado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      logout();
      return false;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

/**
 * Obtém um token válido (renova se necessário)
 */
export async function getValidToken(): Promise<string | null> {
  const token = getAccessToken();
  
  if (!token) {
    return null;
  }

  // Se o token está expirado ou expirando em breve, renovar
  if (isTokenExpired() || isTokenExpiringSoon()) {
    const renewed = await refreshAccessToken();
    if (!renewed) {
      return null;
    }
    return getAccessToken();
  }

  return token;
}

/**
 * Faz logout removendo todos os dados de autenticação
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/**
 * Faz uma requisição autenticada com renovação automática de token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Obter token válido (renova se necessário)
  const token = await getValidToken();
  
  if (!token) {
    logout();
    throw new Error('Não autenticado');
  }

  // Adicionar header de autorização
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se retornar 401, tentar renovar o token uma vez
  if (response.status === 401) {
    console.log('⚠️ Recebeu 401, tentando renovar token...');
    
    const renewed = await refreshAccessToken();
    
    if (renewed) {
      // Tentar novamente com o novo token
      const newToken = getAccessToken();
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        },
      });
      
      if (retryResponse.status === 401) {
        // Se ainda retornar 401, fazer logout
        logout();
      }
      
      return retryResponse;
    } else {
      // Não conseguiu renovar, fazer logout
      logout();
    }
  }

  return response;
}

/**
 * Inicia o timer de renovação automática de token
 */
export function startTokenRefreshTimer(): void {
  // Verificar a cada 10 minutos se precisa renovar
  setInterval(async () => {
    const token = getAccessToken();
    if (!token) return;

    if (isTokenExpiringSoon() && !isTokenExpired()) {
      console.log('🔄 Token expirando em breve, renovando automaticamente...');
      await refreshAccessToken();
    }
  }, 10 * 60 * 1000); // 10 minutos
}

/**
 * Inicializa o serviço de autenticação
 */
export function initAuthService(): void {
  // Iniciar timer de renovação automática
  startTokenRefreshTimer();

  // Adicionar listener para visibilidade da página
  // (renovar quando o usuário voltar para a página)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      const token = getAccessToken();
      if (token && (isTokenExpired() || isTokenExpiringSoon())) {
        console.log('🔄 Página voltou ao foco, renovando token...');
        await refreshAccessToken();
      }
    }
  });

  console.log('✅ Serviço de autenticação inicializado');
}



