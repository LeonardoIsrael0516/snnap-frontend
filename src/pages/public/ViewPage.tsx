import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { aiPagesService, getPageBySlug } from "@/lib/aiPages";
import { biolinksService, Biolink } from "@/lib/biolinks";
import { BlockRenderer } from "@/components/biolink/BlockRenderer";
import { Loader2 } from "lucide-react";
import { InlineVisualEditor } from "@/components/InlineVisualEditor";

type PageType = 'ai' | 'biolink';

export default function ViewPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  const [html, setHtml] = useState<string>("");
  const [biolink, setBiolink] = useState<Biolink | null>(null);
  const [pageType, setPageType] = useState<PageType | null>(null);
  const [pageId, setPageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [pageData, setPageData] = useState<any>(null);


  // Função para processar o HTML e garantir funcionamento completo
  const processHtmlForIframe = (rawHtml: string, pageData?: any) => {
    // Se o HTML já tem estrutura completa, usar como está
    if (rawHtml.includes('<!DOCTYPE html>') && rawHtml.includes('<html')) {
      let processedHtml = rawHtml;
      
      // Aplicar configurações da página se disponíveis
      if (pageData) {
        // Atualizar título da página
        if (pageData.pageTitle) {
          processedHtml = processedHtml.replace(
            /<title>.*?<\/title>/i,
            `<title>${pageData.pageTitle}</title>`
          );
        }
        
        // Atualizar meta description
        if (pageData.pageDescription) {
          processedHtml = processedHtml.replace(
            /<meta name="description" content=".*?">/i,
            `<meta name="description" content="${pageData.pageDescription}">`
          );
        }
        
        // Adicionar meta tags se não existirem
        if (pageData.pageTitle && !processedHtml.includes('<title>')) {
          processedHtml = processedHtml.replace(
            '<head>',
            `<head>\n  <title>${pageData.pageTitle}</title>`
          );
        }
        
        if (pageData.pageDescription && !processedHtml.includes('name="description"')) {
          processedHtml = processedHtml.replace(
            '<head>',
            `<head>\n  <meta name="description" content="${pageData.pageDescription}">`
          );
        }
      }
      
      // Adicionar script para interceptar links se ainda não existe
      if (!processedHtml.includes('// Link interceptor script')) {
        const linkScript = `
<script>
// Link interceptor script
document.addEventListener('DOMContentLoaded', function() {
  // Interceptar todos os cliques em links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      e.preventDefault();
      
      // Verificar se deve abrir em nova aba
      const shouldOpenNewTab = link.target === '_blank' || 
                              e.ctrlKey || 
                              e.metaKey || 
                              e.button === 1; // Middle click
      
      if (shouldOpenNewTab) {
        window.open(link.href, '_blank');
      } else {
        // Navegar na janela principal
        if (window.parent && window.parent !== window) {
          window.parent.location.href = link.href;
        } else {
          window.location.href = link.href;
        }
      }
    }
  });
});
</script>`;
        
        // Inserir o script antes do </body>
        return processedHtml.replace('</body>', linkScript + '\n</body>');
      }
      return processedHtml;
    }

    // Caso contrário, envolver em estrutura HTML completa
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Página Gerada</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  ${rawHtml}
  
<script>
// Link interceptor script
document.addEventListener('DOMContentLoaded', function() {
  // Interceptar todos os cliques em links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      e.preventDefault();
      
      // Verificar se deve abrir em nova aba
      const shouldOpenNewTab = link.target === '_blank' || 
                              e.ctrlKey || 
                              e.metaKey || 
                              e.button === 1; // Middle click
      
      if (shouldOpenNewTab) {
        window.open(link.href, '_blank');
      } else {
        // Navegar na janela principal
        if (window.parent && window.parent !== window) {
          window.parent.location.href = link.href;
        } else {
          window.location.href = link.href;
        }
      }
    }
  });
});
</script>
</body>
</html>`;
  };

  useEffect(() => {
    const loadPage = async () => {
      if (!slug) return;
      
      try {
        // Try to load as AI page
        try {
          const aiPage = await getPageBySlug(slug);
          
          if (aiPage) {
            setPageType('ai');
            setPageId(aiPage.id);
            setHtml(aiPage.html_content);
            setPageData(aiPage); // Salvar dados completos da página
            setIsLoading(false);
            return;
          }
        } catch (aiError) {
          console.log("Not an AI page, trying biolink...");
        }

        // Try to load biolink from microservice
        try {
          const BIOLINK_SERVICE_URL = 'http://localhost:3003';
          const response = await fetch(`${BIOLINK_SERVICE_URL}/${slug}`);
          
          if (response.ok) {
            // Biolink encontrado - redirecionar para o microserviço
            window.location.href = `${BIOLINK_SERVICE_URL}/${slug}`;
            return;
          }
        } catch (biolinkError) {
          console.log("Not a biolink either");
        }

        setError("Página não encontrada");
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading page:", err);
        setError("Erro ao carregar página");
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug, editMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // AI Page with edit mode
  if (editMode && pageId && pageType === 'ai') {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <InlineVisualEditor 
          pageId={pageId} 
          initialHtml={html}
          onSave={() => {
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Render AI page - Usar microserviço
  if (pageType === 'ai') {
    const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
    const ssrUrl = `${linkAiUrl}/${slug}`;
    
    // Redirecionar imediatamente
    window.location.href = ssrUrl;
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando página...</p>
        </div>
      </div>
    );
  }

  // Render Biolink
  if (pageType === 'biolink' && biolink) {
    const getBackgroundStyle = (): React.CSSProperties => {
      const bg = biolink.settings.background;
      let style: React.CSSProperties = {};

      switch (bg.type) {
        case 'color':
          style.backgroundColor = bg.value;
          break;
        case 'gradient':
          style.background = bg.value;
          break;
        case 'image':
          style.backgroundImage = `url(${bg.value})`;
          style.backgroundSize = 'cover';
          style.backgroundPosition = 'center';
          break;
        case 'video':
          // Video background would need special handling
          break;
      }

      if (bg.blur) {
        style.backdropFilter = `blur(${bg.blur}px)`;
      }

      return style;
    };

    return (
      <>
        {/* SEO Meta Tags */}
        {biolink.settings.metaTitle && (
          <title>{biolink.settings.metaTitle}</title>
        )}
        {biolink.settings.favicon && (
          <link rel="icon" href={biolink.settings.favicon} />
        )}
        
        <div 
          className="min-h-screen py-8 px-4"
          style={getBackgroundStyle()}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            {biolink.blocks.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Nenhum conteúdo disponível
              </div>
            ) : (
              biolink.blocks.map((block) => (
                <div key={block.id}>
                  <BlockRenderer block={block} />
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  return null;
}
