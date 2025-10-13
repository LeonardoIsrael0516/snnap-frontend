const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface AIPage {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  thumbnail_url?: string;
  views: number;
  created_at: string;
  updated_at: string;
  favicon_url?: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  custom_css?: string;
  
  // SEO avançado
  pageTitle?: string;
  pageDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: string;
  
  // Pixels e tracking
  facebookPixel?: string;
  googleAnalytics?: string;
  googleTagManager?: string;
  tiktokPixel?: string;
  linkedinPixel?: string;
  twitterPixel?: string;
  
  // Configurações de página
  customHead?: string;
  customBody?: string;
  customFooter?: string;
  
  // Configurações PWA
  pwaEnabled?: boolean;
  pwaName?: string;
  pwaShortName?: string;
  pwaDescription?: string;
  pwaIconUrl?: string;
  pwaThemeColor?: string;
  pwaBackgroundColor?: string;
  pwaDisplayMode?: string;
  pwaStartUrl?: string;
  pwaScope?: string;
  pwaShowInstallPrompt?: boolean;
  
  // Domínio personalizado
  customDomainId?: string | null;
}

export interface CreatePageData {
  title: string;
  slug: string;
  prompt: string;
}

export interface CreatePageWithHTMLData {
  title: string;
  slug: string;
  html_content: string;
  favicon_url?: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  custom_css?: string;
}

export interface StreamMessage {
  role: string;
  content: string | any[];
}

export interface StreamCreatePageParams {
  messages: StreamMessage[];
  onDelta: (delta: string, isHtml: boolean) => void;
  onDone: (pageData?: any) => void;
  onError: (error: string) => void;
  pageId?: string; // Optional page ID for edit requests
  title?: string; // Optional title for new pages
  slug?: string; // Optional slug for new pages
}

const getAuthHeaders = async () => {
  const { getValidToken } = await import('./authService');
  const token = await getValidToken();
  
  if (!token) {
    throw new Error('Token não disponível');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const checkAPIConfiguration = async (): Promise<boolean> => {
  try {
    // Usar endpoint correto /health (não /api/ai-pages/health)
    const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
    const response = await fetch(healthUrl);
    
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao verificar configurações:', error);
    return false;
  }
};

export const aiPagesService = {
  async getAll(): Promise<AIPage[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/ai-pages`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar páginas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar páginas:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<AIPage> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/ai-pages/${id}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Página não encontrada');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar página:', error);
      throw error;
    }
  },

         async create(data: CreatePageData): Promise<AIPage> {
           console.log('🔄 aiPagesService.create - Iniciando criação:', data);
           
           const hasAPIConfig = await checkAPIConfiguration();
           if (!hasAPIConfig) {
             throw new Error('Nenhuma API de IA foi configurada pelo administrador. Entre em contato com o suporte.');
           }

           try {
             console.log('🔄 aiPagesService.create - Enviando requisição para:', `${API_BASE_URL}/ai-pages`);
             
             // Adicionar timeout de 60 segundos (IA pode demorar)
             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 60000);
             
             const headers = await getAuthHeaders();
             const response = await fetch(`${API_BASE_URL}/ai-pages`, {
               method: 'POST',
               headers,
               body: JSON.stringify(data),
               signal: controller.signal,
             });

             clearTimeout(timeoutId);

             console.log('🔄 aiPagesService.create - Resposta recebida:', {
               status: response.status,
               ok: response.ok,
               statusText: response.statusText,
             });

             if (!response.ok) {
               const errorData = await response.json();
               console.error('❌ aiPagesService.create - Erro na resposta:', errorData);
               throw new Error(errorData.error || 'Erro ao criar página');
             }

             const result = await response.json();
             console.log('✅ aiPagesService.create - Página criada com sucesso:', result);
             return result;
           } catch (error) {
             if (error.name === 'AbortError') {
               console.error('❌ aiPagesService.create - Timeout na requisição');
               throw new Error('Timeout na requisição. Tente novamente.');
             }
             console.error('❌ aiPagesService.create - Erro ao criar página:', error);
             throw error;
           }
         },

  async createWithHTML(data: CreatePageWithHTMLData): Promise<AIPage> {
    try {
      console.log('🔄 aiPagesService.createWithHTML - Iniciando criação direta:', data);
      
      const dataAny = data as any; // Cast para evitar erros de tipagem
      
      // For HTML pages, we need to create them directly in the database
      // Convert to the format expected by the backend
      const createData = {
        title: data.title,
        slug: data.slug,
        prompt: "Página criada via editor", // Placeholder prompt
        htmlContent: data.html_content,
        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        ogTitle: data.og_title,
        ogDescription: data.og_description,
        ogImage: data.og_image,
        faviconUrl: data.favicon_url,
        customCss: data.custom_css,
        pageTitle: dataAny.pageTitle,
        pageDescription: dataAny.pageDescription,
        keywords: dataAny.keywords,
        canonicalUrl: dataAny.canonicalUrl,
        robots: dataAny.robots,
        facebookPixel: dataAny.facebookPixel,
        googleAnalytics: dataAny.googleAnalytics,
        googleTagManager: dataAny.googleTagManager,
        tiktokPixel: dataAny.tiktokPixel,
        linkedinPixel: dataAny.linkedinPixel,
        twitterPixel: dataAny.twitterPixel,
        customHead: dataAny.customHead,
        customFooter: dataAny.customFooter,
        // Flag para indicar que é criação direta (sem IA)
        directCreation: true,
      };

      console.log('🔄 aiPagesService.createWithHTML - Enviando requisição para:', `${API_BASE_URL}/ai-pages`);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/ai-pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(createData),
      });

      console.log('🔄 aiPagesService.createWithHTML - Resposta recebida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ aiPagesService.createWithHTML - Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao salvar página');
      }

      const result = await response.json();
      console.log('✅ aiPagesService.createWithHTML - Página criada com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ aiPagesService.createWithHTML - Erro ao salvar página:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<AIPage>): Promise<AIPage> {
    console.log('🔄 aiPagesService.update - Iniciando atualização:', { id, updates });
    
    try {
      // Convert from snake_case to camelCase for backend
      const convertedUpdates: any = {};
      const updatesAny = updates as any; // Cast para evitar erros de tipagem
      
      if (updates.title) convertedUpdates.title = updates.title;
      if (updates.slug) convertedUpdates.slug = updates.slug;
      if (updates.html_content) convertedUpdates.htmlContent = updates.html_content;
      if (updates.favicon_url) convertedUpdates.faviconUrl = updates.favicon_url;
      
      // Mapear campos que podem vir em camelCase do frontend
      if (updatesAny.faviconUrl) convertedUpdates.faviconUrl = updatesAny.faviconUrl;
      if (updatesAny.metaTitle) convertedUpdates.metaTitle = updatesAny.metaTitle;
      if (updatesAny.metaDescription) convertedUpdates.metaDescription = updatesAny.metaDescription;
      if (updatesAny.ogTitle) convertedUpdates.ogTitle = updatesAny.ogTitle;
      if (updatesAny.ogDescription) convertedUpdates.ogDescription = updatesAny.ogDescription;
      if (updatesAny.ogImage) convertedUpdates.ogImage = updatesAny.ogImage;
      if (updatesAny.customCss) convertedUpdates.customCss = updatesAny.customCss;
      
      // Mapear campos snake_case (para compatibilidade)
      if (updates.meta_title) convertedUpdates.metaTitle = updates.meta_title;
      if (updates.meta_description) convertedUpdates.metaDescription = updates.meta_description;
      if (updates.og_title) convertedUpdates.ogTitle = updates.og_title;
      if (updates.og_description) convertedUpdates.ogDescription = updates.og_description;
      if (updates.og_image) convertedUpdates.ogImage = updates.og_image;
      if (updates.custom_css) convertedUpdates.customCss = updates.custom_css;
      
      // Campos que já estão em camelCase (não precisam conversão)
      if (updatesAny.pageTitle !== undefined) convertedUpdates.pageTitle = updatesAny.pageTitle;
      if (updatesAny.pageDescription !== undefined) convertedUpdates.pageDescription = updatesAny.pageDescription;
      if (updatesAny.keywords !== undefined) convertedUpdates.keywords = updatesAny.keywords;
      if (updatesAny.canonicalUrl !== undefined) convertedUpdates.canonicalUrl = updatesAny.canonicalUrl;
      if (updatesAny.robots !== undefined) convertedUpdates.robots = updatesAny.robots;
      if (updatesAny.facebookPixel !== undefined) convertedUpdates.facebookPixel = updatesAny.facebookPixel;
      if (updatesAny.googleAnalytics !== undefined) convertedUpdates.googleAnalytics = updatesAny.googleAnalytics;
      if (updatesAny.googleTagManager !== undefined) convertedUpdates.googleTagManager = updatesAny.googleTagManager;
      if (updatesAny.tiktokPixel !== undefined) convertedUpdates.tiktokPixel = updatesAny.tiktokPixel;
      if (updatesAny.linkedinPixel !== undefined) convertedUpdates.linkedinPixel = updatesAny.linkedinPixel;
      if (updatesAny.twitterPixel !== undefined) convertedUpdates.twitterPixel = updatesAny.twitterPixel;
      if (updatesAny.customHead !== undefined) convertedUpdates.customHead = updatesAny.customHead;
      if (updatesAny.customBody !== undefined) convertedUpdates.customBody = updatesAny.customBody;
      if (updatesAny.customFooter !== undefined) convertedUpdates.customFooter = updatesAny.customFooter;
      
      // Campos PWA
      if (updatesAny.pwaEnabled !== undefined) convertedUpdates.pwaEnabled = updatesAny.pwaEnabled;
      if (updatesAny.pwaName !== undefined) convertedUpdates.pwaName = updatesAny.pwaName;
      if (updatesAny.pwaShortName !== undefined) convertedUpdates.pwaShortName = updatesAny.pwaShortName;
      if (updatesAny.pwaDescription !== undefined) convertedUpdates.pwaDescription = updatesAny.pwaDescription;
      if (updatesAny.pwaIconUrl !== undefined) convertedUpdates.pwaIconUrl = updatesAny.pwaIconUrl;
      if (updatesAny.pwaThemeColor !== undefined) convertedUpdates.pwaThemeColor = updatesAny.pwaThemeColor;
      if (updatesAny.pwaBackgroundColor !== undefined) convertedUpdates.pwaBackgroundColor = updatesAny.pwaBackgroundColor;
      if (updatesAny.pwaDisplayMode !== undefined) convertedUpdates.pwaDisplayMode = updatesAny.pwaDisplayMode;
      if (updatesAny.pwaStartUrl !== undefined) convertedUpdates.pwaStartUrl = updatesAny.pwaStartUrl;
      if (updatesAny.pwaScope !== undefined) convertedUpdates.pwaScope = updatesAny.pwaScope;
      if (updatesAny.pwaShowInstallPrompt !== undefined) {
        console.log('🔔 aiPagesService: pwaShowInstallPrompt detectado:', updatesAny.pwaShowInstallPrompt, 'tipo:', typeof updatesAny.pwaShowInstallPrompt);
        convertedUpdates.pwaShowInstallPrompt = updatesAny.pwaShowInstallPrompt;
      }
      
      // Custom Domain
      if (updatesAny.customDomainId !== undefined) {
        console.log('🌐 aiPagesService: customDomainId detectado:', updatesAny.customDomainId);
        convertedUpdates.customDomainId = updatesAny.customDomainId;
      }

      console.log('🔄 aiPagesService.update - Enviando requisição para:', `${API_BASE_URL}/ai-pages/${id}`);
      console.log('🔄 aiPagesService.update - Dados convertidos:', convertedUpdates);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/ai-pages/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(convertedUpdates),
      });

      console.log('🔄 aiPagesService.update - Resposta recebida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ aiPagesService.update - Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao atualizar página');
      }

      const result = await response.json();
      console.log('✅ aiPagesService.update - Página atualizada com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar página:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/ai-pages/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar página');
      }
    } catch (error) {
      console.error('Erro ao deletar página:', error);
      throw error;
    }
  }
};

export const getPageBySlug = async (slug: string): Promise<AIPage> => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/${slug}`);
    
    if (!response.ok) {
      throw new Error('Página não encontrada');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    throw error;
  }
};

export const streamCreatePage = async ({ messages, onDelta, onDone, onError, pageId, title, slug }: StreamCreatePageParams): Promise<void> => {
  console.log('🚀 Iniciando streamCreatePage');
  
  const hasAPIConfig = await checkAPIConfiguration();
  console.log('🔧 API Config check:', hasAPIConfig);
  
  if (!hasAPIConfig) {
    onError('Nenhuma API de IA foi configurada pelo administrador. Entre em contato com o suporte.');
    return;
  }

  try {
    // Extract the user message and create the data structure expected by the backend
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      onError('Mensagem inválida');
      return;
    }

    // Extract prompt from content (handle both string and array types)
    let prompt = '';
    if (typeof lastMessage.content === 'string') {
      prompt = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      // For multimodal content, extract text parts
      const textParts = lastMessage.content.filter(part => part.type === 'text');
      prompt = textParts.map(part => part.text).join(' ');
    }
    
    if (!prompt.trim()) {
      onError('Prompt vazio');
      return;
    }

    // Use provided title and slug, or create temporary ones from prompt
    const finalTitle = title || (prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''));
    const finalSlug = slug || finalTitle.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);

    const createData = {
      title: finalTitle,
      slug: finalSlug,
      prompt: prompt,
      messages: messages,
      ...(pageId && { id: pageId }) // Include page ID for edit requests
    };

    // Use real streaming endpoint
    console.log('📤 Enviando requisição para:', `${API_BASE_URL}/ai-pages/stream`);
    console.log('📤 Dados completos:', JSON.stringify(createData, null, 2));
    console.log('📤 Dados:', createData);
    console.log('📤 Tem pageId?', !!pageId, 'Valor:', pageId);
    
    const headers = await getAuthHeaders();
    console.log('📤 Headers obtidos');
    const response = await fetch(`${API_BASE_URL}/ai-pages/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData),
    });

    console.log('📥 Resposta recebida:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na resposta:', errorData);
      
      // Verificar se é erro de créditos insuficientes
      if (errorData.code === 'INSUFFICIENT_CREDITS') {
        onError(`INSUFFICIENT_CREDITS:${errorData.requiredCredits}:${errorData.action}`);
        return;
      }
      
      onError(errorData.error || 'Erro ao criar página');
      return;
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      onError('Erro ao processar resposta');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let htmlContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'start') {
                onDelta(data.message, false);
              } else if (data.type === 'content') {
                htmlContent += data.content;
                onDelta(data.content, true);
              } else if (data.type === 'done') {
                console.log('✅ Stream concluído, dados da página:', data.page);
                onDone(data.page);
                return;
              } else if (data.type === 'error') {
                console.log('❌ Erro recebido no stream:', data);
                console.log('❌ Error field:', data.error);
                onError(data.error);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
  } catch (error) {
    console.error('💥 Erro no stream:', error);
    console.error('💥 Error type:', typeof error);
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      onError('Erro de conexão: Verifique se o backend está rodando e se você está logado');
    } else {
      onError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }
};
