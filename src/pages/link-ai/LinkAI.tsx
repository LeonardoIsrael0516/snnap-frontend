import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Copy, Trash2, BarChart3, ExternalLink, Loader2, Eye, Palette, Download, Upload, Sparkles, Lightbulb, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { aiPagesService, AIPage } from "@/lib/aiPages";
import { InlineVisualEditor } from "@/components/InlineVisualEditor";
import { useTranslation } from "@/contexts/TranslationContext";
import { exportPage, importPage, validateSnnaplinkFile } from "@/lib/exportImport";
import { ExamplesCarousel } from "@/components/ExamplesCarousel";
import { SkeletonCards } from "@/components/SkeletonCards";
import { InspireBox } from "@/components/InspireBox";
import { FeaturedTemplates } from "@/components/FeaturedTemplates";
import InsufficientCreditsModalFree from "@/components/InsufficientCreditsModalFree";
import InsufficientCreditsModalPaid from "@/components/InsufficientCreditsModalPaid";

export default function LinkAI() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [links, setLinks] = useState<AIPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<AIPage | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [inspireBoxOpen, setInspireBoxOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [pageToExport, setPageToExport] = useState<AIPage | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [insufficientCreditsModalOpen, setInsufficientCreditsModalOpen] = useState(false);
  const [insufficientCreditsData, setInsufficientCreditsData] = useState<{
    requiredCredits: number;
    action: 'criação' | 'edição' | 'importação';
  } | null>(null);
  const [userPlan, setUserPlan] = useState<{ name: string; isFree: boolean } | null>(null);
  useEffect(() => {
    loadLinks();
    loadUserPlan();
  }, []);

  // Carregar dados do plano do usuário
  const loadUserPlan = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPlan({
          name: data.plan?.name || 'Free',
          isFree: data.plan?.name === 'Free' || !data.plan
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  // Verificar localStorage para créditos insuficientes vindos da página de edição
  useEffect(() => {
    const checkInsufficientCredits = () => {
      const insufficientCreditsData = localStorage.getItem('insufficientCredits');
      if (insufficientCreditsData) {
        try {
          const data = JSON.parse(insufficientCreditsData);
          console.log('💰 Dados de créditos insuficientes encontrados no localStorage:', data);
          
          // Verificar se os dados são recentes (últimos 5 segundos)
          if (Date.now() - data.timestamp < 5000) {
            setInsufficientCreditsData({
              requiredCredits: data.requiredCredits,
              action: data.action
            });
            setInsufficientCreditsModalOpen(true);
          }
          
          // Limpar os dados do localStorage
          localStorage.removeItem('insufficientCredits');
        } catch (error) {
          console.error('Erro ao processar dados de créditos insuficientes:', error);
          localStorage.removeItem('insufficientCredits');
        }
      }
    };

    // Verificar imediatamente
    checkInsufficientCredits();

    // Verificar periodicamente (caso o usuário navegue diretamente)
    const interval = setInterval(checkInsufficientCredits, 1000);
    
    return () => clearInterval(interval);
  }, []);
  // Função para verificar créditos antes de realizar ações
  const checkCreditsBeforeAction = async (requiredCredits: number, action: 'criação' | 'edição' | 'importação'): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user/check-credits?required=${requiredCredits}&action=${action}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.hasCredits) {
          setInsufficientCreditsData({
            requiredCredits,
            action
          });
          setInsufficientCreditsModalOpen(true);
          return false;
        }
        
        return true;
      } else {
        toast.error("Erro ao verificar créditos. Tente novamente.");
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      toast.error("Erro ao verificar créditos. Tente novamente.");
      return false;
    }
  };

  const loadLinks = async () => {
    try {
      const data = await aiPagesService.getAll();
      setLinks(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar páginas");
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateLink = () => {
    setCreateModalOpen(true);
  };

  const handleExampleSelect = (prompt: string) => {
    setNewPrompt(prompt);
    setCreateModalOpen(true);
  };
  const handleConfirmCreate = async () => {
    if (!newTitle.trim()) {
      toast.error("Por favor, insira um título");
      return;
    }
    if (!newSlug.trim()) {
      toast.error("Por favor, insira um slug");
      return;
    }

    // Verificar créditos antes de criar a página
    const hasCredits = await checkCreditsBeforeAction(2, 'criação');
    if (!hasCredits) {
      return; // Modal de créditos insuficientes já foi aberto
    }

    // Navigate with state containing the initial data
    navigate("/link-ai/create", {
      state: {
        title: newTitle,
        slug: newSlug,
        initialPrompt: newPrompt
      }
    });

    // Reset fields
    setNewTitle("");
    setNewSlug("");
    setNewPrompt("");
    setCreateModalOpen(false);
  };
  const handleDuplicate = async (page: AIPage) => {
    try {
      const newSlug = `${page.slug}-copia-${Date.now()}`;
      await aiPagesService.createWithHTML({
        title: `${page.title} (Cópia)`,
        slug: newSlug,
        html_content: page.html_content
      });
      toast.success("Link duplicado com sucesso!");
      loadLinks();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao duplicar link");
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm(t.linkAI.confirmDelete)) return;
    try {
      await aiPagesService.delete(id);
      setLinks(links.filter(link => link.id !== id));
      toast.success(t.linkAI.deleteSuccess);
    } catch (error) {
      console.error(error);
      toast.error(t.linkAI.errorDeleting);
    }
  };

  const handleExportClick = (page: AIPage) => {
    setPageToExport(page);
    setExportModalOpen(true);
  };

  const handleConfirmExport = () => {
    if (!pageToExport) return;
    
    try {
      console.log('📤 Exportando página completa:', {
        id: pageToExport.id,
        title: pageToExport.title,
        slug: pageToExport.slug,
        hasHtmlContent: !!pageToExport.html_content,
        htmlContentLength: pageToExport.html_content?.length || 0,
        hasFavicon: !!pageToExport.favicon_url,
        hasMetaTitle: !!pageToExport.meta_title,
        hasCustomCss: !!pageToExport.custom_css,
      });
      
      exportPage(pageToExport);
      toast.success(t.linkAI.exportSuccess);
      setExportModalOpen(false);
      setPageToExport(null);
    } catch (error) {
      console.error('❌ Erro na exportação:', error);
      toast.error(t.linkAI.errorExporting);
    }
  };

  const handleImportClick = () => {
    setImportModalOpen(true);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    // Verificar créditos antes de importar
    const hasCredits = await checkCreditsBeforeAction(1, 'importação');
    if (!hasCredits) {
      return; // Modal de créditos insuficientes já foi aberto
    }

    console.log('📁 Arquivo selecionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validateSnnaplinkFile(file)) {
      console.log('❌ Arquivo inválido:', file.name);
      toast.error(t.linkAI.invalidFile);
      return;
    }

    setImporting(true);
    setImportModalOpen(false);
    toast.info('🔄 Iniciando importação...');

    try {
      console.log('🔄 Iniciando importação...');
      const importData = await importPage(file);
      
      console.log('📥 Importando dados:', {
        hasTitle: !!importData.data.title,
        hasSlug: !!importData.data.slug,
        hasHtmlContent: !!importData.data.html_content,
        htmlContentLength: importData.data.html_content?.length || 0,
        version: importData.version,
        type: importData.type,
      });
      
      toast.info('🔄 Criando página importada...');
      console.log('🔄 Criando página importada diretamente com HTML...');
      
      // Criar página diretamente com HTML importado (sem passar pela IA)
      const newPage = await aiPagesService.createWithHTML({
        title: `${importData.data.title} (Importada)`,
        slug: `${importData.data.slug}-importada-${Date.now()}`,
        html_content: importData.data.html_content,
        favicon_url: importData.data.favicon_url,
        meta_title: importData.data.meta_title,
        meta_description: importData.data.meta_description,
        og_title: importData.data.og_title,
        og_description: importData.data.og_description,
        og_image: importData.data.og_image,
        custom_css: importData.data.custom_css,
        // Campos adicionais serão ignorados pois não estão na interface CreatePageWithHTMLData
      });

      console.log('✅ Página importada criada:', {
        id: newPage.id,
        title: newPage.title,
        slug: newPage.slug,
        hasHtmlContent: !!newPage.html_content,
        htmlContentLength: newPage.html_content?.length || 0,
      });

      console.log('✅ Importação concluída com sucesso!');
      toast.success(t.linkAI.importSuccess);
      loadLinks();
    } catch (error) {
      console.error('❌ Erro na importação:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
      toast.error(t.linkAI.errorImporting);
    } finally {
      setImporting(false);
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleSaveEdit = () => {
    setEditingPage(null);
    loadLinks();
  };

  const handleImportTemplate = async (templateId: string) => {
    try {
      // Recarregar a lista de páginas após importação
      await loadLinks();
    } catch (error) {
      console.error("Erro ao recarregar páginas:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Welcome Section - Always visible */}
      <div className="text-center py-8 mb-6">
        <div className="w-20 h-20 rounded-full gradient-instagram flex items-center justify-center mb-6 glow-primary mx-auto">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {links.length === 0 ? "Bem-vindo à Snnap!" : "O que vamos criar hoje?"}
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        {links.length === 0 ? (
          <>
            Crie sites, biolinks, convites e muito mais, tudo com o poder da IA.
            Basta descrever sua ideia e o Snnap transforma em uma página completa em segundos.
          </>
        ) : (
          <>
            Continue criando páginas incríveis com IA. Escolha um template ou crie algo novo.
          </>
        )}
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <div className="flex flex-col items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            {/* InspireBox Button - Only when user has pages */}
            {links.length > 0 && (
              <Button 
                onClick={() => setInspireBoxOpen(true)} 
                variant="outline" 
                size="default"
                className="hover-gradient"
              >
                <Lightbulb className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span>InspireBox</span>
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".snnaplink"
              onChange={handleImport}
              className="hidden"
            />
           <Button 
             onClick={handleImportClick} 
             variant="outline" 
             size="default"
             className="hover-gradient"
             disabled={importing}
           >
             {importing ? (
               <>
                 <div className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                 <span className="hidden md:inline">Importando...</span>
                 <span className="md:hidden">Import...</span>
               </>
             ) : (
               <>
                 <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                 <span className="hidden md:inline">{t.linkAI.importPage}</span>
                 <span className="md:hidden">Import</span>
               </>
             )}
           </Button>
            <Button onClick={handleCreateLink} size="default" className="gradient-instagram text-white hover:opacity-90">
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              <span className="hidden md:inline">{t.linkAI.createNew}</span>
              <span className="md:hidden">Criar</span>
            </Button>
          </div>
        </div>
      </div>

      {isLoading && <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>}

      {importing && <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Importando página...</p>
            <p className="text-sm text-gray-500 mt-2">Criando página exatamente como exportada</p>
          </div>
        </div>}

      {!isLoading && !importing && links.length === 0 && (
        <div className="space-y-8">
          {/* Featured Templates */}
          <FeaturedTemplates 
            onImportTemplate={handleImportTemplate} 
            onOpenInspireBox={() => setInspireBoxOpen(true)}
          />

          {/* Skeleton Cards */}
          <SkeletonCards />
        </div>
      )}

      {!isLoading && !importing && links.length > 0 && <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 md:pb-6">
            {links.map(link => {
              // Sempre usar URL completa do microserviço link-ai para preview
              const LINK_AI_URL = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'https://snnap-link-ai.onrender.com';
              const previewUrl = `${LINK_AI_URL}/${link.slug}`;
              
              return <Card key={link.id} className="group hover:border-primary/50 transition-smooth overflow-hidden">
                <div className="h-32 relative overflow-hidden bg-muted">
                  <iframe 
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full pointer-events-none scale-50 origin-top-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    style={{ width: '200%', height: '200%', overflow: 'hidden' }}
                    title={`Preview de ${link.title}`}
                    scrolling="no"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{link.title}</CardTitle>
                      
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Link</p>
                    <button 
                      onClick={() => {
                        const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                        const fullUrl = `${linkAiUrl}/${link.slug}`;
                        navigator.clipboard.writeText(fullUrl);
                        toast.success(t.linkAI.linkCopied);
                      }}
                      className="flex items-center gap-2 w-full text-xs font-mono text-white hover-gradient p-2 rounded-md group overflow-hidden"
                    >
                      <span className="truncate flex-1 text-left break-all">
                        {(() => {
                          const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                          return `${linkAiUrl}/${link.slug}`;
                        })()}
                      </span>
                      <Copy className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{link.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/link-ai/edit/${link.id}`)} className="hover-gradient flex-shrink-0">
                      <Pencil className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">{t.linkAI.editPage}</span>
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => {
                      // Sempre usar URL completa do microserviço link-ai
                      const LINK_AI_URL = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'https://snnap-link-ai.onrender.com';
                      window.open(`${LINK_AI_URL}/${link.slug}`, '_blank');
                    }} className="hover-gradient flex-shrink-0">
                      <Eye className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">{t.linkAI.viewPage}</span>
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => navigate(`/analytics/${link.id}`)} className="hover-gradient flex-shrink-0">
                      <BarChart3 className="w-3 h-3" />
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => handleExportClick(link)} className="hover-gradient flex-shrink-0">
                      <Download className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">{t.linkAI.exportPage}</span>
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(link)} className="hover-gradient flex-shrink-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(link.id)} className="hover-gradient flex-shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>;
            })}
          </div>
        </>}

      <Dialog open={!!editingPage} onOpenChange={open => !open && setEditingPage(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
          {editingPage && <InlineVisualEditor pageId={editingPage.id} initialHtml={editingPage.html_content} onSave={handleSaveEdit} />}
        </DialogContent>
      </Dialog>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.linkAI.createNew}</DialogTitle>
            <DialogDescription>
              Preencha as informações básicas para criar sua nova página
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" placeholder="Ex: Meu Portfólio" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" placeholder="Ex: meu-portfolio" value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
              <p className="text-xs text-muted-foreground">
                Será acessível em: {(() => {
                  const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                  return `${linkAiUrl}/${newSlug || "seu-slug"}`;
                })()}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">{t.linkAI.initialPrompt}</Label>
              <Textarea id="prompt" placeholder="Ex: Crie uma página de portfólio com fundo gradiente roxo..." value={newPrompt} onChange={e => setNewPrompt(e.target.value)} rows={4} />
              <p className="text-xs text-muted-foreground">
                {t.linkAI.promptHint}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCreate} className="gradient-instagram text-white">
              Criar Página
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* InspireBox Modal */}
      <InspireBox
        open={inspireBoxOpen}
        onOpenChange={setInspireBoxOpen}
        onImportTemplate={handleImportTemplate}
      />

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Página
            </DialogTitle>
            <DialogDescription>
              Exporte sua página para um arquivo .snnaplink que pode ser importado posteriormente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {pageToExport && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Página a ser exportada:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Título:</strong> {pageToExport.title}</p>
                  <p><strong>Slug:</strong> {pageToExport.slug}</p>
                  <p><strong>URL:</strong> <code className="text-xs bg-muted px-1 rounded">/{pageToExport.slug}</code></p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">O que é exportado?</h4>
                  <p className="text-sm text-muted-foreground">
                    Todo o conteúdo da sua página: HTML, CSS personalizado, metadados, favicon e configurações.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Como importar depois?</h4>
                  <p className="text-sm text-muted-foreground">
                    Use o botão "Importar" na página principal para restaurar a página a partir do arquivo .snnaplink.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Backup</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantenha seus arquivos .snnaplink como backup ou para compartilhar suas páginas com outros usuários ou até vender sua criação.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmExport} className="gradient-instagram text-white">
              <Download className="w-4 h-4 mr-2" />
              Baixar Arquivo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Página
            </DialogTitle>
            <DialogDescription>
              Importe uma página a partir de um arquivo .snnaplink exportado anteriormente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Arquivo .snnaplink</h4>
                  <p className="text-sm text-muted-foreground">
                    Selecione um arquivo .snnaplink exportado anteriormente para restaurar uma página completa.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">O que será importado?</h4>
                  <p className="text-sm text-muted-foreground">
                    Todo o conteúdo da página: HTML, CSS personalizado, metadados, favicon e configurações.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Nova página criada</h4>
                  <p className="text-sm text-muted-foreground">
                    A página importada será criada como uma nova página com slug único, preservando o original.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".snnaplink"
                onChange={handleImport}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Selecione um arquivo .snnaplink</p>
              <p className="text-xs text-muted-foreground mb-4">
                Clique para escolher ou arraste o arquivo aqui
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                size="sm"
                className="hover-gradient"
              >
                <Upload className="w-4 h-4 mr-2" />
                Escolher Arquivo
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insufficient Credits Modals */}
      {insufficientCreditsData && (
        <>
          {/* Modal para usuários Free */}
          {userPlan?.isFree && (
            <InsufficientCreditsModalFree
              open={insufficientCreditsModalOpen}
              onOpenChange={setInsufficientCreditsModalOpen}
              requiredCredits={insufficientCreditsData.requiredCredits}
              action={insufficientCreditsData.action}
              onPlanSelected={(planId) => {
                console.log('Plano selecionado:', planId);
                // Aqui você implementaria a lógica de seleção de plano
                toast.info('Redirecionando para seleção de plano...');
              }}
            />
          )}
          
          {/* Modal para usuários com planos pagos */}
          {!userPlan?.isFree && (
            <InsufficientCreditsModalPaid
              open={insufficientCreditsModalOpen}
              onOpenChange={setInsufficientCreditsModalOpen}
              requiredCredits={insufficientCreditsData.requiredCredits}
              action={insufficientCreditsData.action}
              onPlanSelected={(planId) => {
                console.log('Plano selecionado:', planId);
                // Aqui você implementaria a lógica de seleção de plano
                toast.info('Redirecionando para seleção de plano...');
              }}
              onCreditsPurchased={(packageId) => {
                console.log('Pacote de créditos selecionado:', packageId);
                // Aqui você implementaria a lógica de compra de créditos
                toast.info('Redirecionando para compra de créditos...');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}