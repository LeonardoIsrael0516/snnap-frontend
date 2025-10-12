import { AIPage } from './aiPages';

export interface SnnaplinkExport {
  version: string;
  type: 'snnaplink-page';
  data: {
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
    pageTitle?: string;
    pageDescription?: string;
    keywords?: string;
    canonicalUrl?: string;
    robots?: string;
    facebookPixel?: string;
    googleAnalytics?: string;
    googleTagManager?: string;
    tiktokPixel?: string;
    linkedinPixel?: string;
    twitterPixel?: string;
    customHead?: string;
    customFooter?: string;
  };
  exported_at: string;
  exported_by: string;
}

export const exportPage = (page: AIPage): void => {
  console.log('📤 Exportando página:', {
    id: page.id,
    title: page.title,
    slug: page.slug,
    hasHtmlContent: !!page.html_content,
    htmlContentLength: page.html_content?.length || 0,
  });

  const exportData: SnnaplinkExport = {
    version: '1.0.0',
    type: 'snnaplink-page',
    data: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      html_content: page.html_content,
      thumbnail_url: page.thumbnail_url,
      views: page.views,
      created_at: page.created_at,
      updated_at: page.updated_at,
      favicon_url: page.favicon_url,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      og_title: page.og_title,
      og_description: page.og_description,
      og_image: page.og_image,
      custom_css: page.custom_css,
      pageTitle: page.pageTitle,
      pageDescription: page.pageDescription,
      keywords: page.keywords,
      canonicalUrl: page.canonicalUrl,
      robots: page.robots,
      facebookPixel: page.facebookPixel,
      googleAnalytics: page.googleAnalytics,
      googleTagManager: page.googleTagManager,
      tiktokPixel: page.tiktokPixel,
      linkedinPixel: page.linkedinPixel,
      twitterPixel: page.twitterPixel,
      customHead: page.customHead,
      customFooter: page.customFooter,
    },
    exported_at: new Date().toISOString(),
    exported_by: 'Snnap Export System',
  };

  console.log('📤 Dados de exportação:', {
    hasHtmlContent: !!exportData.data.html_content,
    htmlContentLength: exportData.data.html_content?.length || 0,
    hasTitle: !!exportData.data.title,
    hasSlug: !!exportData.data.slug,
  });

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${page.slug}.snnaplink`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importPage = (file: File): Promise<SnnaplinkExport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData: SnnaplinkExport = JSON.parse(content);
        
        console.log('📥 Dados parseados do arquivo:', {
          type: importData.type,
          version: importData.version,
          hasData: !!importData.data,
          hasTitle: !!importData.data?.title,
          hasSlug: !!importData.data?.slug,
          hasHtmlContent: !!importData.data?.html_content,
          htmlContentLength: importData.data?.html_content?.length || 0,
        });
        
        // Validar estrutura do arquivo
        if (!importData.version || !importData.type || !importData.data) {
          throw new Error('Arquivo inválido: estrutura incorreta');
        }
        
        if (importData.type !== 'snnaplink-page') {
          throw new Error('Arquivo inválido: não é um arquivo snnaplink');
        }
        
        if (!importData.data.title || !importData.data.slug) {
          throw new Error('Arquivo inválido: dados da página incompletos');
        }
        
        resolve(importData);
      } catch (error) {
        reject(new Error(`Erro ao importar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsText(file);
  });
};

export const validateSnnaplinkFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.snnaplink');
};
