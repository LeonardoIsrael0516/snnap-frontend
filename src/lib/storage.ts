// Serviço de Storage - Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://snnap-backend.onrender.com/api';

export interface StorageConfig {
  id: string;
  provider: string;
  uploadUrl: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  error?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
  error?: string;
}

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Buscar token de autenticação
  private async getAuthHeaders() {
    const { getValidToken } = await import('./authService');
    const token = await getValidToken();
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Buscar configurações de storage
  async getConfigs(): Promise<{ success: boolean; data?: StorageConfig[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/storage/config`, {
        headers: await this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações de storage:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Criar configuração de storage
  async createConfig(config: Omit<StorageConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: StorageConfig; error?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/storage/config`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(config),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar configuração de storage:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Atualizar configuração de storage
  async updateConfig(id: string, config: Partial<StorageConfig>): Promise<{ success: boolean; data?: StorageConfig; error?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/storage/config/${id}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(config),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configuração de storage:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Deletar configuração de storage
  async deleteConfig(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/storage/config/${id}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar configuração de storage:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Testar conexão com storage
  async testConnection(config: Partial<StorageConfig>): Promise<TestResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/storage/test`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(config),
      });

      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        error: data.error,
      };
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return {
        success: false,
        message: 'Erro de conexão',
        error: 'Erro interno',
      };
    }
  }

  // Upload de arquivo
  async uploadFile(file: File, folder: string = 'uploads'): Promise<UploadResult> {
    try {
      console.log('🔧 StorageService - Iniciando upload:', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        folder 
      });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const token = localStorage.getItem('token');
      console.log('🔧 StorageService - Token encontrado:', !!token);
      
      const { getValidToken } = await import('./authService');
      const validToken = await getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/storage/upload`, {
        method: 'POST',
        headers: {
          ...(validToken && { Authorization: `Bearer ${validToken}` }),
        },
        body: formData,
      });

      console.log('🔧 StorageService - Response status:', response.status);
      const data = await response.json();
      console.log('🔧 StorageService - Response data:', data);
      return {
        success: data.success,
        url: data.data?.url,
        key: data.data?.key,
        filename: data.data?.filename,
        size: data.data?.size,
        mimeType: data.data?.mimeType,
        error: data.error,
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: 'Erro de conexão',
      };
    }
  }

  // Upload de múltiplos arquivos
  async uploadFiles(files: File[], folder: string = 'uploads'): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, folder);
      results.push(result);
    }
    
    return results;
  }

  // Gerar URL de preview para imagem
  generateImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return '';
    
    // Se for uma URL do Wasabi/S3, pode adicionar parâmetros de redimensionamento
    // Por enquanto, retorna a URL original
    return url;
  }

  // Validar tipo de arquivo
  isValidFileType(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      // Imagens
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Vídeos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/x-matroska', // .mkv
      // Documentos
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido. Tipos aceitos: Imagens (JPG, PNG, GIF, WebP, SVG), Vídeos (MP4, WebM, MOV, AVI), Documentos (PDF, DOC, DOCX, TXT)',
      };
    }

    // Validar tamanho - 50MB para vídeos, 10MB para outros
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB para vídeo, 10MB para outros
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${isVideo ? '50MB' : '10MB'}`,
      };
    }

    return { valid: true };
  }
}

// Instância singleton
export const storageService = StorageService.getInstance();
