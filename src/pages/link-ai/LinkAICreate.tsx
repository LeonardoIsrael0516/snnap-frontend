import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Save, Palette, ImagePlus, X, ExternalLink, CheckCircle, Share2, MessageSquare, Eye, Paperclip, FileImage, FileVideo, FileText } from "lucide-react";
import { streamCreatePage, aiPagesService, CreatePageWithHTMLData } from "@/lib/aiPages";
import { Label } from "@/components/ui/label";
import { PageSettingsDialog } from "@/components/PageSettingsDialog";
import { CustomDomainSelector } from "@/components/domains/CustomDomainSelector";
import { getDomainById, getPageUrl, CustomDomain } from "@/lib/customDomains";
import { InlineVisualEditor } from "@/components/InlineVisualEditor";
import { storageService } from "@/lib/storage";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useTranslation } from "@/contexts/TranslationContext";

type Message = { role: "user" | "assistant" | "system"; content: string | any[] };

type MobileTab = "chat" | "preview";

export default function LinkAICreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { t } = useTranslation();
  const [currentId, setCurrentId] = useState<string | null>(id || null);
  const isEditing = !!currentId;
  
  // Get initial data from navigation state
  const initialState = location.state as { title?: string; slug?: string; initialPrompt?: string } | null;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Descreva a página que você quer criar. Por exemplo: 'Crie uma página de links para minhas redes sociais com design moderno e vibrante'",
    },
  ]);
  const [prompt, setPrompt] = useState(initialState?.initialPrompt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [pageTitle, setPageTitle] = useState(initialState?.title || "");
  const [pageSlug, setPageSlug] = useState(initialState?.slug || "");
  const [isLoadingPage, setIsLoadingPage] = useState(isEditing);
  const [isVisualEditMode, setIsVisualEditMode] = useState(false);
  const [hasMetadataChanges, setHasMetadataChanges] = useState(false);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPageData, setNewPageData] = useState<any>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [customDomainId, setCustomDomainId] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<CustomDomain | null>(null);
  const [justCreated, setJustCreated] = useState(false);

  // Debug para modo visual
  useEffect(() => {
    console.log('🎨 Estado do modo visual:', { isVisualEditMode, currentId, generatedHtml: generatedHtml.length });
  }, [isVisualEditMode, currentId, generatedHtml]);

  // Recuperar ID da URL quando a página é carregada
  useEffect(() => {
    if (id && !currentId) {
      console.log('🔄 Recuperando ID da URL:', id);
      setCurrentId(id);
    }
  }, [id]); // Removido currentId das dependências

  // Garantir que o ID seja definido na inicialização
  useEffect(() => {
    if (id && !currentId) {
      console.log('🔄 Inicializando ID da URL:', id);
      setCurrentId(id);
    }
  }, []); // Executa apenas uma vez na montagem

  // Detectar mudanças na URL e forçar recuperação
  useEffect(() => {
    if (id && id !== currentId) {
      console.log('🔄 URL mudou, atualizando ID:', id);
      setCurrentId(id);
    }
  }, [id, currentId]);

  // Carregar dados da página quando o ID é recuperado
  useEffect(() => {
    console.log('📄 [useEffect-sync] Executando:', { currentId, isLoadingPage, hasHtml: !!generatedHtml, justCreated });
    
    if (!currentId) {
      console.log('📄 Sem currentId, ignorando');
      return;
    }

    // Se acabamos de criar, não recarregar
    if (justCreated) {
      console.log('📄 Página acabou de ser criada, não recarregar');
      setJustCreated(false);
      return;
    }

    // Se não tem HTML, carregar dados completos
    if (!generatedHtml) {
      console.log('📄 Carregando dados da página (sem HTML):', currentId);
      loadPageData(currentId);
      return;
    }

    // Se já tem HTML, apenas sincronizar customDomainId
    console.log('📄 Página já tem HTML, sincronizando customDomainId:', currentId);
    aiPagesService.getById(currentId).then(pageData => {
      console.log('📄 Dados recebidos:', { 
        hasData: !!pageData, 
        customDomainId: pageData?.customDomainId,
        currentCustomDomainId: customDomainId 
      });
      if (pageData && pageData.customDomainId !== customDomainId) {
        console.log('📄 Atualizando customDomainId de', customDomainId, 'para', pageData.customDomainId);
        setCustomDomainId(pageData.customDomainId || null);
      }
    }).catch(err => console.error('❌ Erro ao sincronizar customDomainId:', err));
  }, [currentId, generatedHtml]); // Executar quando currentId ou HTML mudar

  // Carregar domínio customizado quando customDomainId mudar
  useEffect(() => {
    const loadCustomDomain = async () => {
      console.log('🌐 useEffect customDomainId mudou:', customDomainId);
      if (customDomainId) {
        try {
          console.log('🌐 Buscando domínio:', customDomainId);
          const domain = await getDomainById(customDomainId);
          console.log('🌐 Domínio encontrado:', domain);
          setCustomDomain(domain);
          console.log('🌐 Domínio customizado carregado:', domain?.domain);
        } catch (error) {
          console.error('❌ Erro ao carregar domínio:', error);
          setCustomDomain(null);
        }
      } else {
        console.log('🌐 Nenhum customDomainId, limpando customDomain');
        setCustomDomain(null);
      }
    };

    loadCustomDomain();
  }, [customDomainId]);

  // Função para carregar dados da página
  const loadPageData = async (pageId: string) => {
    if (!pageId) {
      console.log('⚠️ ID da página não fornecido');
      return;
    }
    
    try {
      console.log('📄 Iniciando carregamento da página:', pageId);
      setIsLoadingPage(true);
      const pageData = await aiPagesService.getById(pageId);
      
      if (pageData) {
        setPageTitle(pageData.title);
        setPageSlug(pageData.slug);
        setGeneratedHtml(pageData.html_content);
        console.log('📄 Dados da página carregados - customDomainId:', pageData.customDomainId);
        setCustomDomainId(pageData.customDomainId || null);
        
        // Carregar configurações da página
        setPageSettings({
          slug: pageData.slug || "",
          favicon_url: pageData.favicon_url || "",
          meta_title: pageData.meta_title || "",
          meta_description: pageData.meta_description || "",
          og_title: pageData.og_title || "",
          og_description: pageData.og_description || "",
          og_image: pageData.og_image || "",
          custom_css: pageData.custom_css || "",
          page_title: pageData.pageTitle || "",
          page_description: pageData.pageDescription || "",
          keywords: pageData.keywords || "",
          canonical_url: pageData.canonicalUrl || "",
          robots: pageData.robots || "index,follow",
          facebook_pixel: pageData.facebookPixel || "",
          google_analytics: pageData.googleAnalytics || "",
          google_tag_manager: pageData.googleTagManager || "",
          tiktok_pixel: pageData.tiktokPixel || "",
          linkedin_pixel: pageData.linkedinPixel || "",
          twitter_pixel: pageData.twitterPixel || "",
          custom_head: pageData.customHead || "",
          custom_body: pageData.customBody || "",
          custom_footer: pageData.customFooter || "",
          // Configurações PWA
          pwa_enabled: pageData.pwaEnabled || false,
          pwa_name: pageData.pwaName || "",
          pwa_short_name: pageData.pwaShortName || "",
          pwa_description: pageData.pwaDescription || "",
          pwa_icon_url: pageData.pwaIconUrl || "",
          pwa_theme_color: pageData.pwaThemeColor || "",
          pwa_background_color: pageData.pwaBackgroundColor || "",
          pwa_display_mode: pageData.pwaDisplayMode || "",
          pwa_start_url: pageData.pwaStartUrl || "",
          pwa_scope: pageData.pwaScope || "",
        });
        
        console.log('✅ Dados da página carregados:', pageData.title);
        console.log('✅ Configurações carregadas:', pageData.favicon_url);
      } else {
        console.log('⚠️ Página não encontrada:', pageId);
        toast.error('Página não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da página:', error);
      toast.error('Erro ao carregar dados da página');
    } finally {
      setIsLoadingPage(false);
    }
  };

  // Monitor modal state
  useEffect(() => {
    console.log('🔔 Estado do modal mudou:', { showSuccessModal, hasNewPageData: !!newPageData });
  }, [showSuccessModal, newPageData]);

  // Função para rastrear mudanças nos metadados
  const handleTitleChange = (newTitle: string) => {
    setPageTitle(newTitle);
    setHasMetadataChanges(true);
  };

  const handleSlugChange = (newSlug: string) => {
    setPageSlug(newSlug);
    setHasMetadataChanges(true);
  };

  // Função para compartilhar o link
  const handleShareSnapy = async () => {
    if (!pageSlug.trim()) {
      toast.error("Slug da página não encontrado");
      return;
    }
    
    const pageUrl = `${window.location.origin}/${pageSlug}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: pageTitle || 'Minha página Snapy',
          text: 'Confira minha página criada com Snapy!',
          url: pageUrl,
        });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch (error) {
      // Fallback para copiar para clipboard
      try {
        await navigator.clipboard.writeText(pageUrl);
        toast.success("Link copiado para a área de transferência!");
      } catch (clipboardError) {
        toast.error("Erro ao compartilhar o link");
      }
    }
  };

  // Função para salvar apenas metadados
  const handleSaveMetadata = async () => {
    if (!pageTitle.trim() || !pageSlug.trim()) {
      toast.error("Preencha o título e slug");
      return;
    }

    if (!currentId) {
      toast.error("Página não encontrada");
      return;
    }

    setIsSavingMetadata(true);
    try {
      // Mapear campos do frontend para o formato do backend
      const backendData = {
        title: pageTitle,
        slug: pageSlug,
        htmlContent: generatedHtml,
        // SEO básico
        faviconUrl: pageSettings.favicon_url,
        metaTitle: pageSettings.meta_title,
        metaDescription: pageSettings.meta_description,
        ogTitle: pageSettings.og_title,
        ogDescription: pageSettings.og_description,
        ogImage: pageSettings.og_image,
        customCss: pageSettings.custom_css,
        // SEO avançado
        pageTitle: pageSettings.page_title,
        pageDescription: pageSettings.page_description,
        keywords: pageSettings.keywords,
        canonicalUrl: pageSettings.canonical_url,
        robots: pageSettings.robots,
        // Pixels e tracking
        facebookPixel: pageSettings.facebook_pixel,
        googleAnalytics: pageSettings.google_analytics,
        googleTagManager: pageSettings.google_tag_manager,
        tiktokPixel: pageSettings.tiktok_pixel,
        linkedinPixel: pageSettings.linkedin_pixel,
        twitterPixel: pageSettings.twitter_pixel,
        // Configurações de página
        customHead: pageSettings.custom_head,
        customBody: pageSettings.custom_body,
        customFooter: pageSettings.custom_footer,
      };
      
      await aiPagesService.update(currentId, backendData);
      toast.success("Título e slug atualizados com sucesso!");
      setHasMetadataChanges(false);
    } catch (error: any) {
      console.error("Erro ao salvar metadados:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("Este slug já existe. Escolha outro.");
      } else {
        toast.error("Erro ao atualizar título e slug");
      }
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setNewPageData(null);
    navigate("/link-ai");
  };

  // Função para processar HTML e adicionar Tailwind CSS
  const processHtmlForIframe = (rawHtml: string) => {
    // Gerar meta tags baseadas nas configurações
    const generateMetaTags = () => {
      const metaTags = [];
      
      // Meta tags básicas
      if (pageSettings.meta_title) {
        metaTags.push(`<title>${pageSettings.meta_title}</title>`);
      }
      if (pageSettings.meta_description) {
        metaTags.push(`<meta name="description" content="${pageSettings.meta_description}">`);
      }
      if (pageSettings.keywords) {
        metaTags.push(`<meta name="keywords" content="${pageSettings.keywords}">`);
      }
      if (pageSettings.robots) {
        metaTags.push(`<meta name="robots" content="${pageSettings.robots}">`);
      }
      if (pageSettings.canonical_url) {
        metaTags.push(`<link rel="canonical" href="${pageSettings.canonical_url}">`);
      }
      if (pageSettings.favicon_url) {
        metaTags.push(`<link rel="icon" href="${pageSettings.favicon_url}">`);
      }
      
      // Open Graph
      if (pageSettings.og_title) {
        metaTags.push(`<meta property="og:title" content="${pageSettings.og_title}">`);
      }
      if (pageSettings.og_description) {
        metaTags.push(`<meta property="og:description" content="${pageSettings.og_description}">`);
      }
      if (pageSettings.og_image) {
        metaTags.push(`<meta property="og:image" content="${pageSettings.og_image}">`);
      }
      metaTags.push(`<meta property="og:type" content="website">`);
      
      // Twitter Card
      if (pageSettings.og_title) {
        metaTags.push(`<meta name="twitter:title" content="${pageSettings.og_title}">`);
      }
      if (pageSettings.og_description) {
        metaTags.push(`<meta name="twitter:description" content="${pageSettings.og_description}">`);
      }
      if (pageSettings.og_image) {
        metaTags.push(`<meta name="twitter:image" content="${pageSettings.og_image}">`);
      }
      metaTags.push(`<meta name="twitter:card" content="summary_large_image">`);
      
      return metaTags.join('\n  ');
    };

    // Gerar scripts de pixels
    const generatePixelScripts = () => {
      const scripts = [];
      
      if (pageSettings.google_analytics) {
        scripts.push(`
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${pageSettings.google_analytics}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${pageSettings.google_analytics}');
</script>`);
      }
      
      if (pageSettings.google_tag_manager) {
        scripts.push(`
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${pageSettings.google_tag_manager}');</script>`);
      }
      
      if (pageSettings.facebook_pixel) {
        scripts.push(`
<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pageSettings.facebook_pixel}');
fbq('track', 'PageView');
</script>`);
      }
      
      if (pageSettings.tiktok_pixel) {
        scripts.push(`
<!-- TikTok Pixel -->
<script>
!function (w, d, t) {
  w.TikTokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["track","page","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
}(window, document, 'ttq');
ttq.load('${pageSettings.tiktok_pixel}');
ttq.page();
</script>`);
      }
      
      if (pageSettings.linkedin_pixel) {
        scripts.push(`
<!-- LinkedIn Pixel -->
<script type="text/javascript">
_linkedin_partner_id = "${pageSettings.linkedin_pixel}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>`);
      }
      
      if (pageSettings.twitter_pixel) {
        scripts.push(`
<!-- Twitter Pixel -->
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('init','${pageSettings.twitter_pixel}');
twq('track','PageView');
</script>`);
      }
      
      return scripts.join('\n');
    };

    // Gerar CSS customizado
    const generateCustomCSS = () => {
      let css = `
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }`;
      
      if (pageSettings.custom_css) {
        css += `\n    ${pageSettings.custom_css}`;
      }
      
      return css;
    };

    // Se o HTML já tem estrutura completa, usar como está
    if (rawHtml.includes('<!DOCTYPE html>') && rawHtml.includes('<html')) {
      // Adicionar Tailwind CSS se ainda não existe
      if (!rawHtml.includes('tailwindcss.com')) {
        rawHtml = rawHtml.replace(
          '<head>',
          '<head>\n  <script src="https://cdn.tailwindcss.com"></script>'
        );
      }
      
      // Adicionar meta tags se não existirem
      if (!rawHtml.includes('<meta name="description"')) {
        const metaTags = generateMetaTags();
        if (metaTags) {
          rawHtml = rawHtml.replace(
            '<head>',
            `<head>\n  ${metaTags}`
          );
        }
      }
      
      // Adicionar pixels antes do </body>
      const pixelScripts = generatePixelScripts();
      if (pixelScripts) {
        rawHtml = rawHtml.replace('</body>', `${pixelScripts}\n</body>`);
      }
      
      // Adicionar HTML customizado
      if (pageSettings.custom_head) {
        rawHtml = rawHtml.replace('</head>', `${pageSettings.custom_head}\n</head>`);
      }
      if (pageSettings.custom_body) {
        rawHtml = rawHtml.replace('<body>', `<body>\n${pageSettings.custom_body}`);
      }
      if (pageSettings.custom_footer) {
        rawHtml = rawHtml.replace('</body>', `${pageSettings.custom_footer}\n</body>`);
      }
      
      return rawHtml;
    }

    // Caso contrário, envolver em estrutura HTML completa
    const metaTags = generateMetaTags();
    const pixelScripts = generatePixelScripts();
    const customCSS = generateCustomCSS();
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <script src="https://cdn.tailwindcss.com"></script>
  ${metaTags}
  <style>
${customCSS}
  </style>
  ${pageSettings.custom_head || ''}
</head>
<body>
  ${pageSettings.custom_body || ''}
  ${rawHtml}
  ${pageSettings.custom_footer || ''}
  ${pixelScripts}
</body>
</html>`;
  };
  const [pageSettings, setPageSettings] = useState<{
    // Identificação
    slug?: string;
    
    // SEO básico
    favicon_url?: string;
    meta_title?: string;
    meta_description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    custom_css?: string;
    
    // SEO avançado
    page_title?: string;
    page_description?: string;
    keywords?: string;
    canonical_url?: string;
    robots?: string;
    
    // Pixels e tracking
    facebook_pixel?: string;
    google_analytics?: string;
    google_tag_manager?: string;
    tiktok_pixel?: string;
    linkedin_pixel?: string;
    twitter_pixel?: string;
    
    // Configurações de página
    custom_head?: string;
    custom_body?: string;
    custom_footer?: string;
    
    // Configurações PWA
    pwa_enabled?: boolean;
    pwa_name?: string;
    pwa_short_name?: string;
    pwa_description?: string;
    pwa_icon_url?: string;
    pwa_theme_color?: string;
    pwa_background_color?: string;
    pwa_display_mode?: string;
    pwa_start_url?: string;
    pwa_scope?: string;
    pwa_show_install_prompt?: boolean;
  }>({
    slug: "",
    favicon_url: "",
    meta_title: "",
    meta_description: "",
    og_title: "",
    og_description: "",
    og_image: "",
    custom_css: "",
    page_title: "",
    page_description: "",
    keywords: "",
    canonical_url: "",
    robots: "index,follow",
    facebook_pixel: "",
    google_analytics: "",
    google_tag_manager: "",
    tiktok_pixel: "",
    linkedin_pixel: "",
    twitter_pixel: "",
    custom_head: "",
    custom_body: "",
    custom_footer: "",
  });

  useEffect(() => {
    if (isEditing && id) {
      loadPage(id);
    } else if (initialState?.initialPrompt) {
      // Auto-send initial prompt if provided
      setTimeout(() => {
        handleSend();
      }, 500);
    }
  }, [id, isEditing]);

  const loadPage = async (pageId: string) => {
    try {
      const page = await aiPagesService.getById(pageId);
      
      if (page) {
        setPageTitle(page.title);
        setPageSlug(page.slug);
        
        // LIMPAR HTML ao carregar para remover elementos de edição inline
        const cleanHtml = page.html_content
          .replace(/class="[^"]*editable-element[^"]*"/g, '') // Remove classes de edição
          .replace(/class="[^"]*selected[^"]*"/g, '') 
          .replace(/class="[^"]*hovered[^"]*"/g, '')
          .replace(/class=""\s*/g, '') // Remove atributos class vazios
          .replace(/\s+class=""/g, '') // Remove class="" isolados
          .replace(/<div[^>]*edit-tooltip[^>]*>.*?<\/div>/gs, '') // Remove tooltips residuais
          .replace(/<div[^>]*edit-controls[^>]*>.*?<\/div>/gs, '') // Remove controles residuais
          .replace(/<style[^>]*id="inline-edit-styles"[^>]*>.*?<\/style>/gs, '') // Remove estilos de edição
          .replace(/<script[^>]*>[\s\S]*?testLinks[\s\S]*?<\/script>/gs, '') // Remove scripts de debug
          .trim();
        
        console.log("🧹 HTML limpo ao carregar página:", {
          original: page.html_content.length,
          cleaned: cleanHtml.length,
          hasEditableClass: cleanHtml.includes('editable-element')
        });
        
        setGeneratedHtml(cleanHtml);
        setPageSettings({
          // SEO básico
          favicon_url: page.favicon_url || "",
          meta_title: page.meta_title || "",
          meta_description: page.meta_description || "",
          og_title: page.og_title || "",
          og_description: page.og_description || "",
          og_image: page.og_image || "",
          custom_css: page.custom_css || "",
          
          // SEO avançado
          page_title: page.pageTitle || "",
          page_description: page.pageDescription || "",
          keywords: page.keywords || "",
          canonical_url: page.canonicalUrl || "",
          robots: page.robots || "index,follow",
          
          // Pixels e tracking
          facebook_pixel: page.facebookPixel || "",
          google_analytics: page.googleAnalytics || "",
          google_tag_manager: page.googleTagManager || "",
          tiktok_pixel: page.tiktokPixel || "",
          linkedin_pixel: page.linkedinPixel || "",
          twitter_pixel: page.twitterPixel || "",
          
          // Configurações de página
          custom_head: page.customHead || "",
          custom_body: page.customBody || "",
          custom_footer: page.customFooter || "",
          
          // Configurações PWA
          pwa_enabled: page.pwaEnabled || false,
          pwa_name: page.pwaName || "",
          pwa_short_name: page.pwaShortName || "",
          pwa_description: page.pwaDescription || "",
          pwa_icon_url: page.pwaIconUrl || "",
          pwa_theme_color: page.pwaThemeColor || "",
          pwa_background_color: page.pwaBackgroundColor || "",
          pwa_display_mode: page.pwaDisplayMode || "",
          pwa_start_url: page.pwaStartUrl || "",
          pwa_scope: page.pwaScope || "",
        });
        setMessages([
          {
            role: "assistant",
            content: "Página carregada! Você pode fazer alterações descrevendo o que deseja mudar.",
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar página");
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleImageAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileType = file.type.split('/')[0]; // 'image', 'video', 'application'
      
      console.log('🔧 Iniciando upload do arquivo:', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      });
      
      toast.loading("Fazendo upload do arquivo...", { id: "upload-file" });
      
      // Validar arquivo usando o storageService
      const validation = storageService.isValidFileType(file);
      console.log('🔧 Validação do arquivo:', validation);
      
      if (!validation.valid) {
        toast.error(validation.error, { id: "upload-file" });
        return;
      }

      // Upload para o novo sistema de storage (Wasabi)
      console.log('🔧 Iniciando upload para Wasabi...');
      const result = await storageService.uploadFile(file, 'ai-page-files');
      console.log('🔧 Resultado do upload:', result);

      if (result.success && result.url) {
        // Manter compatibilidade com imagens antigas
        if (fileType === 'image') {
          setAttachedImage(result.url);
        }
        
        // Novo sistema de arquivos
        setAttachedFile({
          url: result.url,
          name: file.name,
          type: file.type
        });
        
        toast.success("Arquivo carregado com sucesso!", { id: "upload-file" });
        console.log('✅ Upload bem-sucedido:', result.url);
      } else {
        console.error('❌ Erro no upload:', result.error);
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      console.error("❌ Erro ao fazer upload do arquivo:", error);
      toast.error(`Erro ao fazer upload do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { id: "upload-file" });
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setAttachedFile(null);
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    const fileInputMobile = document.getElementById("image-upload-mobile") as HTMLInputElement;
    if (fileInputMobile) fileInputMobile.value = "";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return <FileImage className="w-4 h-4" />;
    if (type.startsWith('video')) return <FileVideo className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  const handleSend = async () => {
    console.log('🚀 handleSend chamado:', { 
      currentId, 
      isEditing, 
      hasGeneratedHtml: !!generatedHtml,
      generatedHtmlLength: generatedHtml.length 
    });
    
    if ((!prompt.trim() && !attachedImage && !attachedFile) || isLoading) return;

    // Lógica de reload removida - não é mais necessária

    // Mensagem que será exibida no chat (sem o caminho do arquivo)
    const displayMessage = attachedFile
      ? (prompt || `Insira o arquivo ${attachedFile.name} na página`)
      : attachedImage 
      ? (prompt || "Insira a imagem na página")
      : prompt;

    // Mensagem que será enviada para a IA (com o caminho do arquivo)
    let aiMessage = prompt;
    if (attachedFile) {
      const fileType = attachedFile.type.split('/')[0];
      aiMessage = `${prompt || `Insira o arquivo na página`}\n\nCAMINHO DO ARQUIVO: ${attachedFile.url}\nNOME DO ARQUIVO: ${attachedFile.name}\nTIPO DO ARQUIVO: ${fileType}`;
    } else if (attachedImage) {
      aiMessage = `${prompt || "Insira a imagem na página"}\n\nCAMINHO DA IMAGEM: ${attachedImage}`;
    }

    const userMessage: Message = { 
      role: "user", 
      content: displayMessage // Mostra apenas o texto no chat
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    const currentImageUrl = attachedImage;
    const currentFile = attachedFile;
    setAttachedImage(null);
    setAttachedFile(null);
    setIsLoading(true);

    let chatContent = "";
    // Always start empty - AI will return complete HTML (edited or new)
    let htmlContent = "";
    let currentTitle = pageTitle;
    let currentSlug = pageSlug;
    
    const updateContent = (chunk: string, isHtml: boolean) => {
      if (isHtml) {
        // Remove any remaining markers before adding to HTML
        const cleanChunk = chunk
          .replace(/HTML_END.*$/s, '')
          .replace(/HTML_START/g, '')
          .replace(/\*{3,}/g, '')
          .replace(/```html\s*/g, '')
          .replace(/```\s*/g, '');
        
        htmlContent += cleanChunk;
        setGeneratedHtml(htmlContent);
      } else {
        chatContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: chatContent } : m
            );
          }
          return [...prev, { role: "assistant", content: chatContent }];
        });
        
        // Extract title and slug from chat content (only if not already set by user)
        const titleMatch = chatContent.match(/TITLE:\s*(.+)/);
        const slugMatch = chatContent.match(/SLUG:\s*(.+)/);
        
        // Only update title if user hasn't set it
        if (titleMatch && !pageTitle) {
          currentTitle = titleMatch[1].trim();
          setPageTitle(currentTitle);
        }
        // Only update slug if user hasn't set it and not editing
        if (slugMatch && !pageSlug && !isEditing) {
          currentSlug = slugMatch[1].trim();
          setPageSlug(currentSlug);
        }
      }
    };

    try {
      // Build messages array - keep multimodal format for API
      const apiMessages = messages.map(msg => {
        // Keep multimodal messages as-is for proper API processing
        if (Array.isArray(msg.content)) {
          return {
            role: msg.role,
            content: msg.content
          };
        }
        return msg;
      });
      
      // Add the new user message - usa aiMessage que tem o caminho completo
      apiMessages.push({
        role: "user",
        content: aiMessage
      });
      
      // If editing (has currentId and generated HTML), send current HTML with the message
      // Use generatedHtml from state, which should have the latest content
      const htmlToEdit = generatedHtml || htmlContent;
      if (currentId && htmlToEdit) {
        console.log("🔧 MODO EDIÇÃO - Enviando HTML atual junto com a mensagem");
        console.log("🔧 Detalhes:", { 
          currentId, 
          hasHtml: !!htmlToEdit, 
          htmlLength: htmlToEdit.length,
          isEditing,
          usingGeneratedHtml: !!generatedHtml,
          usingHtmlContent: !!htmlContent
        });
        
        // Clean HTML before sending
        const cleanHtmlForAI = htmlToEdit
          .replace(/class="[^"]*editable-element[^"]*"/g, '') // Remove classes de edição
          .replace(/class="[^"]*selected[^"]*"/g, '') 
          .replace(/class="[^"]*hovered[^"]*"/g, '')
          .replace(/class=""\s*/g, '') // Remove atributos class vazios
          .replace(/\s+class=""/g, '') // Remove class="" isolados
          .replace(/<div[^>]*edit-tooltip[^>]*>.*?<\/div>/gs, '') // Remove tooltips residuais
          .replace(/<div[^>]*edit-controls[^>]*>.*?<\/div>/gs, '') // Remove controles residuais
          .replace(/<style[^>]*id="inline-edit-styles"[^>]*>.*?<\/style>/gs, '') // Remove estilos de edição
          .replace(/<script[^>]*>[\s\S]*?testLinks[\s\S]*?<\/script>/gs, '') // Remove scripts de debug
          .trim();
        
        console.log("🧹 HTML limpo para edição:", {
          original: generatedHtml.length,
          cleaned: cleanHtmlForAI.length
        });
        
        // Modify the user message to include the HTML
        const lastMessageIndex = apiMessages.length - 1;
        if (apiMessages[lastMessageIndex]) {
          const originalContent = apiMessages[lastMessageIndex].content;
          const htmlContent = `${originalContent}

HTML ATUAL DA PÁGINA (use como base para a edição):
${cleanHtmlForAI}

INSTRUÇÕES DE EDIÇÃO:
- Faça APENAS a alteração específica solicitada
- Mantenha TODO o resto do HTML exatamente como está
- Retorne o HTML completo com apenas a modificação solicitada`;
          
          console.log("📝 Mensagem de edição preparada:", {
            originalLength: originalContent.length,
            htmlLength: cleanHtmlForAI.length,
            totalLength: htmlContent.length
          });
          
          apiMessages[lastMessageIndex].content = htmlContent;
        }
        
        // Add system message for edit mode
        apiMessages.splice(apiMessages.length - 1, 0, {
          role: "system",
          content: `🔧 MODO EDIÇÃO PONTUAL 🔧

Você é um editor de HTML especializado em fazer alterações MÍNIMAS e PRECISAS.

REGRAS ABSOLUTAS:
1. COPIE o HTML existente EXATAMENTE como está
2. Faça APENAS a alteração específica mencionada pelo usuário
3. NÃO mude cores, classes, estrutura ou layout não mencionados
4. NÃO adicione ou remova elementos não solicitados
5. Mantenha a mesma indentação e formatação
6. Se não encontrar o elemento mencionado, retorne o HTML original

IMPORTANTE: O usuário fornecerá o HTML atual da página. Use-o como base e faça apenas a alteração solicitada.`
        });
      }
      
      console.log("📤 Enviando mensagens para IA:", apiMessages.length, "mensagens");
      console.log("📤 Modo de edição:", { isEditing, currentId, willEdit: !!currentId });

      await streamCreatePage({
        messages: apiMessages,
        pageId: currentId || undefined, // Use currentId directly to support immediate edits after creation
        title: pageTitle,
        slug: pageSlug,
        onDelta: updateContent,
        onDone: async (pageData?: any) => {
          setIsLoading(false);
          
          // Clean HTML before saving
          const cleanHtml = htmlContent
            .replace(/HTML_END.*$/s, '')
            .replace(/HTML_START/g, '')
            .replace(/\*{3,}/g, '')
            .replace(/```html\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();
          
          // If we have page data from the backend (new page created), show success modal
          console.log('🔍 Verificando se deve mostrar modal:', {
            hasPageData: !!pageData,
            pageData: pageData,
            hasId: pageData?.id,
            isEditing,
            currentId,
            shouldShowModal: pageData && pageData.id && !isEditing
          });
          
          if (pageData && pageData.id && !isEditing) {
            console.log('🎉 Nova página criada, mostrando modal de sucesso');
            console.log('📦 pageData completo:', pageData);
            setNewPageData(pageData);
            setShowSuccessModal(true);
            console.log('✅ Modal state atualizado para: true');
            
            console.log('✅ Página criada com sucesso:', { 
              id: pageData.id, 
              htmlLength: cleanHtml.length,
              slug: pageData.slug
            });
          } else {
            // For edits, show success message and refresh page data
            const successMessage = "✅ Página editada com sucesso! As alterações foram salvas automaticamente.";
            
            setMessages(prev => [
              ...prev,
              {
                role: "assistant",
                content: successMessage,
                timestamp: new Date().toISOString()
              }
            ]);
            
            // Force page reload after edit to ensure everything works correctly
            if (currentId) {
              console.log('🔄 Recarregando página após edição para garantir funcionamento:', currentId);
              setTimeout(() => {
                window.location.reload();
              }, 1500); // Delay to show success message first
            }
          }
          
          // Auto-save when editing (has pageData from edit or currentId from previous creation)
          if (currentId && cleanHtml && currentTitle && currentSlug && (isEditing || pageData?.id)) {
            try {
              console.log('💾 Auto-save após edição:', { currentId, isEditing });
              await aiPagesService.update(currentId, {
                title: currentTitle,
                slug: currentSlug,
                html_content: cleanHtml,
                ...pageSettings,
              });
              toast.success("Alterações salvas automaticamente!");
            } catch (error: any) {
              console.error("Erro no auto-save:", error);
              toast.error("Erro ao salvar automaticamente");
            }
          }
        },
        onError: (error) => {
          setIsLoading(false);
          console.error('❌ Erro na edição:', error);
          console.log('🔍 Tipo do erro:', typeof error);
          console.log('🔍 Conteúdo do erro:', error);
          
          // Verificar se é erro de créditos insuficientes
          if (typeof error === 'string' && error.startsWith('INSUFFICIENT_CREDITS:')) {
            const [, requiredCredits, action] = error.split(':');
            console.log('💰 Erro de créditos insuficientes detectado:', { requiredCredits, action });
            
            // Usar localStorage para comunicar com a página principal
            localStorage.setItem('insufficientCredits', JSON.stringify({
              type: 'INSUFFICIENT_CREDITS',
              requiredCredits: parseFloat(requiredCredits),
              action: action,
              timestamp: Date.now()
            }));
            
            // Redirecionar para a página principal onde o modal será aberto
            window.location.href = '/link-ai';
            
            return;
          }
          
          toast.error(`Erro na edição: ${error}`);
          
          // NÃO remover a mensagem do usuário para manter o contexto
          // setMessages((prev) => prev.slice(0, -1));
          
          // Adicionar mensagem de erro ao chat
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `❌ Erro na edição: ${error}. Tente novamente ou clique em "Recarregar Página".`,
              timestamp: new Date().toISOString()
            }
          ]);
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error("Erro ao processar requisição");
    }
  };


  if (isLoadingPage) {
    return (
      <div className="w-full p-4 max-w-none flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          body {
            overflow-x: hidden !important;
          }
          * {
            max-width: 100vw;
          }
        }
      `}</style>
      <div className="w-full h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 flex flex-wrap items-center gap-2 flex-shrink-0">
        <Button variant="outline" onClick={() => navigate("/link-ai")} className="flex-shrink-0">
          ← Voltar
        </Button>
        {generatedHtml && (
          <PageSettingsDialog
            settings={pageSettings}
            onSave={async (settings) => {
              console.log('🔧 LinkAICreate: Salvando configurações:', settings);
              setPageSettings(settings);
              
              // Salvar automaticamente as configurações no backend
              if (currentId) {
                try {
                  // Mapear campos do frontend para o formato do backend
                  const backendData = {
                    title: pageTitle,
                    slug: pageSlug,
                    htmlContent: generatedHtml,
                    // SEO básico
                    faviconUrl: settings.favicon_url,
                    metaTitle: settings.meta_title,
                    metaDescription: settings.meta_description,
                    ogTitle: settings.og_title,
                    ogDescription: settings.og_description,
                    ogImage: settings.og_image,
                    customCss: settings.custom_css,
                    // SEO avançado
                    pageTitle: settings.page_title,
                    pageDescription: settings.page_description,
                    keywords: settings.keywords,
                    canonicalUrl: settings.canonical_url,
                    robots: settings.robots,
                    // Pixels e tracking
                    facebookPixel: settings.facebook_pixel,
                    googleAnalytics: settings.google_analytics,
                    googleTagManager: settings.google_tag_manager,
                    tiktokPixel: settings.tiktok_pixel,
                    linkedinPixel: settings.linkedin_pixel,
                    twitterPixel: settings.twitter_pixel,
                    // Configurações de página
                    customHead: settings.custom_head,
                    customBody: settings.custom_body,
                    customFooter: settings.custom_footer,
                    // Configurações PWA
                    pwaEnabled: settings.pwa_enabled,
                    pwaName: settings.pwa_name,
                    pwaShortName: settings.pwa_short_name,
                    pwaDescription: settings.pwa_description,
                    pwaIconUrl: settings.pwa_icon_url,
                    pwaThemeColor: settings.pwa_theme_color,
                    pwaBackgroundColor: settings.pwa_background_color,
                    pwaDisplayMode: settings.pwa_display_mode,
                    pwaStartUrl: settings.pwa_start_url,
                    pwaScope: settings.pwa_scope,
                  };
                  
                  console.log('🔧 LinkAICreate: Dados para backend:', backendData);
                  console.log('🔧 LinkAICreate: Campos PWA no backend:', {
                    pwaEnabled: backendData.pwaEnabled,
                    pwaName: backendData.pwaName,
                    pwaShortName: backendData.pwaShortName,
                  });
                  
                  const result = await aiPagesService.update(currentId, backendData);
                  console.log('✅ LinkAICreate: Resposta do backend:', result);
                  console.log('✅ LinkAICreate: Campos PWA na resposta:', {
                    pwaEnabled: result.pwaEnabled,
                    pwaName: result.pwaName,
                    pwaShortName: result.pwaShortName,
                  });
                  
                  // Recarregar as configurações da página
                  const updatedPage = await aiPagesService.getById(currentId);
                  if (updatedPage) {
                    setPageSettings({
                      slug: updatedPage.slug || "",
                      favicon_url: updatedPage.favicon_url || "",
                      meta_title: updatedPage.meta_title || "",
                      meta_description: updatedPage.meta_description || "",
                      og_title: updatedPage.og_title || "",
                      og_description: updatedPage.og_description || "",
                      og_image: updatedPage.og_image || "",
                      custom_css: updatedPage.custom_css || "",
                      page_title: updatedPage.pageTitle || "",
                      page_description: updatedPage.pageDescription || "",
                      keywords: updatedPage.keywords || "",
                      canonical_url: updatedPage.canonicalUrl || "",
                      robots: updatedPage.robots || "index,follow",
                      facebook_pixel: updatedPage.facebookPixel || "",
                      google_analytics: updatedPage.googleAnalytics || "",
                      google_tag_manager: updatedPage.googleTagManager || "",
                      tiktok_pixel: updatedPage.tiktokPixel || "",
                      linkedin_pixel: updatedPage.linkedinPixel || "",
                      twitter_pixel: updatedPage.twitterPixel || "",
                      custom_head: updatedPage.customHead || "",
                      custom_body: updatedPage.customBody || "",
                      custom_footer: updatedPage.customFooter || "",
                      // Configurações PWA
                      pwa_enabled: updatedPage.pwaEnabled || false,
                      pwa_name: updatedPage.pwaName || "",
                      pwa_short_name: updatedPage.pwaShortName || "",
                      pwa_description: updatedPage.pwaDescription || "",
                      pwa_icon_url: updatedPage.pwaIconUrl || "",
                      pwa_theme_color: updatedPage.pwaThemeColor || "",
                      pwa_background_color: updatedPage.pwaBackgroundColor || "",
                      pwa_display_mode: updatedPage.pwaDisplayMode || "",
                      pwa_start_url: updatedPage.pwaStartUrl || "",
                      pwa_scope: updatedPage.pwaScope || "",
                    });
                  }
                  
                  toast.success("Configurações salvas automaticamente!");
                } catch (error) {
                  console.error("Erro ao salvar configurações:", error);
                  toast.error("Erro ao salvar configurações");
                }
              } else {
                toast.success("Configurações salvas!");
              }
            }}
          />
        )}
        {generatedHtml && currentId && (
          <CustomDomainSelector
            pageType="LINK_AI"
            pageId={currentId}
            currentDomainId={customDomainId}
            onDomainChange={async (domainId) => {
              setCustomDomainId(domainId);
              
              // Salvar automaticamente
              if (currentId) {
                try {
                  await aiPagesService.update(currentId, {
                    customDomainId: domainId,
                  });
                  
                  toast.success(
                    domainId
                      ? "Domínio personalizado configurado!"
                      : "Domínio personalizado removido"
                  );
                } catch (error) {
                  console.error("Erro ao salvar domínio:", error);
                  toast.error("Erro ao salvar domínio personalizado");
                }
              }
            }}
          />
        )}
      </div>

      {/* Layout com painéis redimensionáveis */}
      <div className="flex-1 p-4 pt-0 overflow-hidden w-full">
        {/* Layout Desktop - Painéis redimensionáveis lado a lado */}
        <div className="hidden md:block h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full gap-4">
            {/* Chat Panel */}
            <ResizablePanel defaultSize={45} minSize={25} maxSize={75}>
              <Card className="flex flex-col h-full mr-2 bg-muted/30">
            <CardHeader className="border-b border-border">
              <CardTitle>{isEditing ? "Editar com IA" : "Chat com IA"}</CardTitle>
              <CardDescription>
                {isEditing ? "Descreva as alterações que deseja fazer" : "Descreva sua página e converse com a IA"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-auto max-w-[80%]"
                        : "bg-muted max-w-[80%]"
                    }`}
                  >
                    {Array.isArray(msg.content) ? (
                      <div className="space-y-2">
                        {msg.content.map((item: any, i: number) => 
                          item.type === "text" ? (
                            <p key={i} className="text-sm whitespace-pre-wrap">{item.text}</p>
                          ) : item.type === "image_url" ? (
                            <img key={i} src={item.image_url.url} alt="Anexo" className="max-w-full rounded-lg" />
                          ) : null
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Gerando página...</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border p-4 space-y-3">
                {generatedHtml && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="page-title" className="text-xs">
                          Título da Página
                        </Label>
                        <Input
                          id="page-title"
                          placeholder="Minha Página"
                          value={pageTitle}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      {!customDomainId && (
                        <div>
                          <Label htmlFor="page-slug" className="text-xs">
                            Slug (URL)
                          </Label>
                          <Input
                            id="page-slug"
                            placeholder="minha-pagina"
                            value={pageSlug}
                            onChange={(e) =>
                              handleSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                            }
                            className="h-8"
                          />
                        </div>
                      )}
                    </div>
                    {hasMetadataChanges && (
                      <Button
                        onClick={handleSaveMetadata}
                        disabled={isSavingMetadata}
                        className="w-full gradient-instagram text-white mt-2"
                        size="sm"
                      >
                        {isSavingMetadata ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Atualizar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
                {(attachedImage || attachedFile) && (
                  <div className="relative inline-block">
                    {attachedFile && attachedFile.type.startsWith('image') ? (
                      <img src={attachedFile.url} alt={attachedFile.name} className="h-20 w-20 object-cover rounded-lg border border-border" />
                    ) : attachedImage ? (
                      <img src={attachedImage} alt="Anexo" className="h-20 w-20 object-cover rounded-lg border border-border" />
                    ) : attachedFile ? (
                      <div className="h-20 w-auto px-4 flex items-center gap-2 rounded-lg border border-border bg-muted">
                        {getFileIcon(attachedFile.type)}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium truncate max-w-[150px]">{attachedFile.name}</span>
                          <span className="text-[10px] text-muted-foreground">{(attachedFile.type.split('/')[1] || 'file').toUpperCase()}</span>
                        </div>
                      </div>
                    ) : null}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Descreva sua página ou o seu pedido..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={isLoading}
                    />
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      className="hidden"
                      id="image-upload"
                      onChange={handleImageAttach}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    disabled={isLoading}
                    title="Anexar arquivo (imagem, vídeo ou PDF)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || (!prompt.trim() && !attachedImage && !attachedFile)}
                    className="gradient-instagram text-white"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Pressione Enter para enviar</p>
              </div>
            </CardContent>
          </Card>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={55} minSize={25} maxSize={75}>
              <Card className="flex flex-col h-full ml-2 bg-background">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview</CardTitle>
                </div>
                {generatedHtml && currentId && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🔗 Abrindo página - customDomain:', customDomain);
                        console.log('🔗 Abrindo página - customDomainId:', customDomainId);
                        console.log('🔗 Abrindo página - pageSlug:', pageSlug);
                        const pageUrl = getPageUrl(pageSlug, customDomain);
                        console.log('🔗 URL gerada:', pageUrl);
                        window.open(pageUrl, '_blank');
                      }}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir Página
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('📋 Copiando link - customDomain:', customDomain);
                        console.log('📋 Copiando link - customDomainId:', customDomainId);
                        const pageUrl = getPageUrl(pageSlug, customDomain);
                        console.log('📋 URL gerada:', pageUrl);
                        navigator.clipboard.writeText(pageUrl);
                        toast.success('Link copiado!', {
                          description: customDomain ? `Usando domínio: ${customDomain.domain}` : 'Usando domínio padrão'
                        });
                      }}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Copiar Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVisualEditMode(true)}
                      className="gap-2"
                    >
                      <Palette className="w-4 h-4" />
                      Editar Visual
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 bg-muted/10 p-0 overflow-hidden relative">
              {isVisualEditMode && currentId ? (
                <div className="absolute inset-0 z-10 bg-background">
                  <InlineVisualEditor
                    pageId={currentId}
                    initialHtml={generatedHtml}
                    onSave={() => {
                      setIsVisualEditMode(false);
                      loadPage(id);
                    }}
                  />
                </div>
              ) : generatedHtml ? (
                <div className="relative w-full h-full">
                  <iframe
                    srcDoc={processHtmlForIframe(generatedHtml)}
                    className="w-full h-full border-0 transition-opacity duration-300"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full gradient-instagram flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <p className="text-muted-foreground animate-pulse">Atualizando página...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-instagram flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-muted-foreground animate-pulse">Aguardando criação da página...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Layout Mobile - Com sistema de abas */}
        <div className="md:hidden h-full flex flex-col relative pb-14 overflow-hidden w-full">
          {/* Conteúdo das abas */}
          <div className="flex-1 overflow-hidden w-full">
            {/* Aba Chat */}
            {mobileTab === "chat" && (
              <Card className="h-full flex flex-col bg-muted/30 overflow-hidden">
                <CardHeader className="border-b border-border pb-3 flex-shrink-0">
                  <CardTitle className="text-lg">{isEditing ? "Editar com IA" : "Chat com IA"}</CardTitle>
                  <CardDescription className="text-sm">
                    {isEditing ? "Descreva as alterações que deseja fazer" : "Descreva sua página e converse com a IA"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm ${
                          msg.role === "user"
                            ? "bg-primary/10 ml-auto max-w-[85%]"
                            : "bg-muted max-w-[85%]"
                        }`}
                      >
                        {Array.isArray(msg.content) ? (
                          <div className="space-y-2">
                            {msg.content.map((item: any, i: number) => 
                              item.type === "text" ? (
                                <p key={i} className="text-xs whitespace-pre-wrap">{item.text}</p>
                              ) : item.type === "image_url" ? (
                                <img key={i} src={item.image_url.url} alt="Anexo" className="max-w-full rounded-lg" />
                              ) : null
                            )}
                          </div>
                        ) : (
                          <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Gerando página...</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border p-3 space-y-2 flex-shrink-0 w-full">
                    {generatedHtml && (
                      <div className="space-y-2 w-full">
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <Label htmlFor="page-title-mobile" className="text-xs text-muted-foreground">
                              Título da Página
                            </Label>
                            <Input
                              id="page-title-mobile"
                              placeholder="Título da Página"
                              value={pageTitle}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          {!customDomainId && (
                            <div>
                              <Label htmlFor="page-slug-mobile" className="text-xs text-muted-foreground">
                                Slug (URL)
                              </Label>
                              <Input
                                id="page-slug-mobile"
                                placeholder="slug-da-pagina"
                                value={pageSlug}
                                onChange={(e) =>
                                  handleSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                        {hasMetadataChanges && (
                          <Button
                            onClick={handleSaveMetadata}
                            disabled={isSavingMetadata}
                            className="w-full gradient-instagram text-white h-8"
                            size="sm"
                          >
                            {isSavingMetadata ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="w-3 h-3 mr-2" />
                                Salvar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                    {(attachedImage || attachedFile) && (
                      <div className="relative inline-block">
                        {attachedFile && attachedFile.type.startsWith('image') ? (
                          <img src={attachedFile.url} alt={attachedFile.name} className="h-16 w-16 object-cover rounded-lg border border-border" />
                        ) : attachedImage ? (
                          <img src={attachedImage} alt="Anexo" className="h-16 w-16 object-cover rounded-lg border border-border" />
                        ) : attachedFile ? (
                          <div className="h-16 w-auto px-3 flex items-center gap-2 rounded-lg border border-border bg-muted">
                            {getFileIcon(attachedFile.type)}
                            <div className="flex flex-col">
                              <span className="text-[10px] font-medium truncate max-w-[100px]">{attachedFile.name}</span>
                              <span className="text-[8px] text-muted-foreground">{(attachedFile.type.split('/')[1] || 'file').toUpperCase()}</span>
                            </div>
                          </div>
                        ) : null}
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Descreva o que deseja..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          disabled={isLoading}
                          className="h-8 text-sm"
                        />
                        <input
                          type="file"
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          className="hidden"
                          id="image-upload-mobile"
                          onChange={handleImageAttach}
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload-mobile")?.click()}
                        disabled={isLoading}
                        title="Anexar arquivo"
                        className="h-8 w-8"
                      >
                        <Paperclip className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={handleSend}
                        disabled={isLoading || (!prompt.trim() && !attachedImage && !attachedFile)}
                        className="gradient-instagram text-white h-8"
                      >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Criar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aba Preview */}
            {mobileTab === "preview" && (
              <Card className="h-full flex flex-col bg-background overflow-hidden">
                <CardHeader className="border-b border-border pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">Preview</CardTitle>
                      <CardDescription className="text-sm">Visualize sua página</CardDescription>
                    </div>
                    {generatedHtml && currentId && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/${pageSlug}`, '_blank')}
                          className="gap-1 h-7 text-xs px-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsVisualEditMode(true)}
                          className="gap-1 h-7 text-xs px-2"
                        >
                          <Palette className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 bg-muted/10 p-0 overflow-hidden relative">
                  {isVisualEditMode && currentId ? (
                    <div className="absolute inset-0 z-10 bg-background">
                      <InlineVisualEditor
                        pageId={currentId}
                        initialHtml={generatedHtml}
                        onSave={() => {
                          setIsVisualEditMode(false);
                          if (id) loadPageData(id);
                        }}
                      />
                    </div>
                  ) : generatedHtml ? (
                    <div className="relative w-full h-full">
                      <iframe
                        srcDoc={processHtmlForIframe(generatedHtml)}
                        className="w-full h-full border-0"
                        title="Preview"
                        sandbox="allow-scripts"
                      />
                      {isLoading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Atualizando...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Aguardando...</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer de App com Abas - Fixo na parte inferior */}
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl border-t border-border/40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 safe-area-bottom">
            <div className="flex items-center h-16 px-2 max-w-md mx-auto relative gap-1">
              {/* Botão Chat */}
              <button
                onClick={() => setMobileTab("chat")}
                className="relative flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all duration-300 group"
              >
                {/* Linha gradiente no topo quando ativo */}
                {mobileTab === "chat" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-full animate-in fade-in slide-in-from-top-1 duration-300" />
                )}
                
                {/* Conteúdo do botão */}
                <div className="relative flex flex-col items-center justify-center gap-1">
                  <MessageSquare 
                    className={`transition-all duration-300 ${
                      mobileTab === "chat" 
                        ? "w-5 h-5 stroke-[2.5] text-primary" 
                        : "w-[18px] h-[18px] stroke-[2] text-muted-foreground/50 group-hover:text-muted-foreground"
                    }`} 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                    mobileTab === "chat" ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                  }`}>
                    Chat
                  </span>
                </div>
              </button>

              {/* Linha divisória vertical */}
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-border/60 to-transparent" />

              {/* Botão Preview */}
              <button
                onClick={() => setMobileTab("preview")}
                className="relative flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all duration-300 group"
              >
                {/* Linha gradiente no topo quando ativo */}
                {mobileTab === "preview" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-full animate-in fade-in slide-in-from-top-1 duration-300" />
                )}
                
                {/* Conteúdo do botão */}
                <div className="relative flex flex-col items-center justify-center gap-1">
                  <Eye 
                    className={`transition-all duration-300 ${
                      mobileTab === "preview" 
                        ? "w-5 h-5 stroke-[2.5] text-primary" 
                        : "w-[18px] h-[18px] stroke-[2] text-muted-foreground/50 group-hover:text-muted-foreground"
                    }`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                    mobileTab === "preview" ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                  }`}>
                    Preview
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Sucesso para Nova Página */}
      <Dialog open={showSuccessModal} onOpenChange={() => {
        // Não permite fechar o modal clicando fora ou no X
        console.log('🔔 Tentativa de fechar modal bloqueada');
      }}>
        <DialogContent className="w-[90vw] max-w-md mx-auto sm:mx-4 [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-xl">Página Criada com Sucesso!</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Sua página foi criada e salva automaticamente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {newPageData && (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-xs sm:text-sm mb-2">Detalhes da Página:</h4>
                <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <p className="break-words"><strong>Título:</strong> {newPageData.title}</p>
                  <p className="break-all"><strong>Slug:</strong> {newPageData.slug}</p>
                  <p className="break-all"><strong>URL:</strong> <code className="text-xs bg-muted px-1 rounded">/{newPageData.slug}</code></p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    console.log('🔄 Navegando para edição:', `/link-ai/edit/${newPageData.id}`);
                    setShowSuccessModal(false);
                    navigate(`/link-ai/edit/${newPageData.id}`, { replace: true });
                  }}
                  className="w-full gradient-instagram text-white h-10 sm:h-11 text-sm sm:text-base"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Editar Página
                </Button>
                <Button
                  onClick={() => {
                    const LINK_AI_URL = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                    window.open(`${LINK_AI_URL}/${newPageData.slug}`, '_blank');
                  }}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Página
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
