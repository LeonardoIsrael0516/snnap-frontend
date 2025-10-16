const API_BASE_URL = import.meta.env.VITE_BIOLINK_API_URL || 'https://snnap-biolink.onrender.com';

export interface UploadResponse {
  success: boolean;
  filename: string;
  url: string;
  info: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface ImageInfo {
  filename: string;
  url: string;
  info: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export class UploadService {
  /**
   * Upload de imagem para o microserviço biolink
   */
  static async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const { getValidToken } = await import('./authService');
    const token = await getValidToken();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro no upload da imagem');
    }

    return await response.json();
  }

  /**
   * Remove uma imagem do servidor
   */
  static async deleteImage(filename: string): Promise<void> {
    const { getValidToken } = await import('./authService');
    const token = await getValidToken();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}/upload/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar imagem');
    }
  }

  /**
   * Obtém informações de uma imagem
   */
  static async getImageInfo(filename: string): Promise<ImageInfo> {
    const { getValidToken } = await import('./authService');
    const token = await getValidToken();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}/upload/info/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao obter informações da imagem');
    }

    return await response.json();
  }

  /**
   * Valida se o arquivo é uma imagem válida
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB'
      };
    }

    return { valid: true };
  }

  /**
   * Gera URL pública para uma imagem
   */
  static getImageUrl(filename: string): string {
    return `${API_BASE_URL}/uploads/${filename}`;
  }

  /**
   * Cria um preview da imagem antes do upload
   */
  static createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Erro ao criar preview da imagem'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }
}
