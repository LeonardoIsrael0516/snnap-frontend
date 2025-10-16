import { BiolinkSettings, BiolinkBlock } from "./biolinkBlocks";

const API_BASE_URL = import.meta.env.VITE_BIOLINK_API_URL || 'https://snnap-biolink.onrender.com/api';

export interface Biolink {
  id: string;
  slug: string;
  settings: BiolinkSettings;
  blocks: BiolinkBlock[];
  views: number;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  userId?: string;
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

export const biolinksService = {
  async getAll(): Promise<Biolink[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/biolinks`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar biolinks');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching biolinks via API:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Biolink | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/biolinks/${id}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Erro ao buscar biolink');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching biolink by ID:', error);
      throw error;
    }
  },

  async getBySlug(slug: string): Promise<Biolink | null> {
    // Esta função não é mais necessária pois o SSR é feito pelo microserviço
    // Mas mantemos para compatibilidade
    return null;
  },

  async create(biolink: Omit<Biolink, 'id' | 'views' | 'created_at' | 'updated_at'>): Promise<Biolink> {
    try {
      const response = await fetch(`${API_BASE_URL}/biolinks`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          slug: biolink.slug,
          settings: biolink.settings,
          blocks: biolink.blocks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar biolink');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating biolink via API:', error);
      throw error;
    }
  },

  async update(id: string, biolink: Partial<Omit<Biolink, 'id' | 'created_at' | 'updated_at'>>): Promise<Biolink> {
    try {
      const updateData: any = {};
      if (biolink.settings) updateData.settings = biolink.settings;
      if (biolink.blocks) updateData.blocks = biolink.blocks;
      if (biolink.slug) updateData.slug = biolink.slug;

      console.log('📤 Enviando requisição de atualização:', {
        url: `${API_BASE_URL}/biolinks/${id}`,
        data: updateData
      });

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/biolinks/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      console.log('📥 Resposta recebida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao atualizar biolink');
      }

      const data = await response.json();
      console.log('✅ Dados retornados do backend:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating biolink via API:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/biolinks/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar biolink');
      }
    } catch (error) {
      console.error('Error deleting biolink via API:', error);
      throw error;
    }
  },

  async incrementViews(id: string): Promise<void> {
    // Views são incrementadas automaticamente pelo microserviço no SSR
    // Esta função não é mais necessária
    return;
  },
};
