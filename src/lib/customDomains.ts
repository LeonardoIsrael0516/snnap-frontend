export interface CustomDomain {
  id: string;
  domain: string;
  type: 'LINK_AI' | 'BIOLINK';
  status: 'PENDING' | 'ACTIVE' | 'FAILED';
  
  // Cloudflare fields
  cloudflareHostnameId?: string | null;
  txtRecordName?: string | null;
  txtRecordValue?: string | null;
  sslStatus?: string | null;
  sslVerificationErrors?: any | null;
  
  // Configuração
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isRootDomain?: boolean;
  pageId?: string | null;
  slug?: string | null;
  
  // Relações
  ai_pages?: Array<{ id: string; title: string; slug: string }>;
  biolinks?: Array<{ id: string; slug: string }>;
}

export interface DNSVerificationResult {
  verified: boolean;
  records: string[];
  error?: string;
}


/**
 * Lista todos os domínios personalizados do usuário
 */
export async function listCustomDomains(): Promise<CustomDomain[]> {
  try {
    const { authenticatedFetch } = await import('./authService');
    const response = await authenticatedFetch('/api/domains', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao listar domínios');
    }

    const data = await response.json();
    return data.domains;
  } catch (error: any) {
    console.error('[Custom Domains] Erro ao listar domínios:', error);
    throw error;
  }
}

/**
 * Adiciona um novo domínio personalizado
 */
export async function addCustomDomain(
  domain: string,
  type: 'LINK_AI' | 'BIOLINK'
): Promise<{
  domain: CustomDomain;
  cnameTarget: string;
  verification: DNSVerificationResult;
}> {
  try {
    const { authenticatedFetch } = await import('./authService');
    const response = await authenticatedFetch('/api/domains/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, type }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao adicionar domínio');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[Custom Domains] Erro ao adicionar domínio:', error);
    throw error;
  }
}

/**
 * Verifica a configuração DNS de um domínio
 */
export async function verifyCustomDomain(
  domainId: string
): Promise<{
  domain: CustomDomain;
  verification: DNSVerificationResult;
}> {
  try {
    const { authenticatedFetch } = await import('./authService');
    const response = await authenticatedFetch('/api/domains/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domainId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao verificar domínio');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[Custom Domains] Erro ao verificar domínio:', error);
    throw error;
  }
}

/**
 * Remove um domínio personalizado
 */
export async function deleteCustomDomain(domainId: string): Promise<void> {
  try {
    const { authenticatedFetch } = await import('./authService');
    const response = await authenticatedFetch(`/api/domains/${domainId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover domínio');
    }
  } catch (error: any) {
    console.error('[Custom Domains] Erro ao remover domínio:', error);
    throw error;
  }
}

/**
 * Atualiza slug e configurações de um domínio personalizado
 */
export async function updateCustomDomain(
  domainId: string,
  updates: {
    slug?: string | null;
    isRootDomain?: boolean;
    pageId?: string | null;
  }
): Promise<CustomDomain> {
  try {
    const { authenticatedFetch } = await import('./authService');
    const response = await authenticatedFetch(`/api/domains/${domainId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar domínio');
    }

    const data = await response.json();
    return data.domain;
  } catch (error: any) {
    console.error('[Custom Domains] Erro ao atualizar domínio:', error);
    throw error;
  }
}

/**
 * Retorna os domínios ativos de um tipo específico
 */
export async function getActiveDomains(
  type: 'LINK_AI' | 'BIOLINK'
): Promise<CustomDomain[]> {
  try {
    const domains = await listCustomDomains();
    return domains.filter(d => d.type === type && d.status === 'ACTIVE');
  } catch (error) {
    console.error('[Custom Domains] Erro ao buscar domínios ativos:', error);
    return [];
  }
}

/**
 * Busca um domínio específico por ID
 */
export async function getDomainById(domainId: string): Promise<CustomDomain | null> {
  try {
    const domains = await listCustomDomains();
    return domains.find(d => d.id === domainId) || null;
  } catch (error) {
    console.error('[Custom Domains] Erro ao buscar domínio:', error);
    return null;
  }
}

/**
 * Gera a URL completa para uma página com domínio personalizado
 */
export function getPageUrl(slug: string, domain?: CustomDomain | null): string {
  if (domain && domain.status === 'ACTIVE') {
    // Usa o domínio personalizado
    const protocol = domain.domain.includes('localhost') ? 'http' : 'https';
    
    // Se o domínio está configurado como root domain, não adiciona slug
    if (domain.isRootDomain) {
      return `${protocol}://${domain.domain}`;
    }
    
    // Se tem slug personalizado no domínio, usa ele
    if (domain.slug) {
      return `${protocol}://${domain.domain}/${domain.slug}`;
    }
    
    // Caso contrário, usa o slug da página
    return `${protocol}://${domain.domain}/${slug}`;
  }
  
  // Usa o domínio padrão do microserviço link-ai
  const LINK_AI_URL = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'https://snnap-link-ai.onrender.com';
  return `${LINK_AI_URL}/${slug}`;
}
