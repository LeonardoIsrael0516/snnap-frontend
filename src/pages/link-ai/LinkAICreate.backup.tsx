import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Save, Palette, ImagePlus, X, ExternalLink } from "lucide-react";
import { streamCreatePage, aiPagesService } from "@/lib/aiPages";
import { Label } from "@/components/ui/label";
import { PageSettingsDialog } from "@/components/PageSettingsDialog";
import { InlineVisualEditor } from "@/components/InlineVisualEditor";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant" | "system"; content: string | any[] };

export default function LinkAICreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;
  
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
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [pageTitle, setPageTitle] = useState(initialState?.title || "");
  const [pageSlug, setPageSlug] = useState(initialState?.slug || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(isEditing);
  const [isVisualEditMode, setIsVisualEditMode] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Porcentagem
  const [isResizing, setIsResizing] = useState(false);
  const [pageSettings, setPageSettings] = useState<{
    favicon_url?: string;
    meta_title?: string;
    meta_description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    custom_css?: string;
  }>({
    favicon_url: "",
    meta_title: "",
    meta_description: "",
    og_title: "",
    og_description: "",
    og_image: "",
    custom_css: "",
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

  // Funções para redimensionamento (apenas desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth < 1024) return; // Apenas desktop (lg breakpoint)
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || window.innerWidth < 1024) return;
    
    const containerRect = document.querySelector('.resize-container')?.getBoundingClientRect();
    if (!containerRect) return;
    
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limitar entre 20% e 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isResizing]);

  const loadPage = async (pageId: string) => {
    try {
      const pages = await aiPagesService.getAll();
      const page = pages.find(p => p.id === pageId);
      
      if (page) {
        setPageTitle(page.title);
        setPageSlug(page.slug);
        setGeneratedHtml(page.html_content);
        setPageSettings({
          favicon_url: page.favicon_url || "",
          meta_title: page.meta_title || "",
          meta_description: page.meta_description || "",
          og_title: page.og_title || "",
          og_description: page.og_description || "",
          og_image: page.og_image || "",
          custom_css: page.custom_css || "",
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
      toast.loading("Fazendo upload da imagem...", { id: "upload-image" });
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('ai-page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ai-page-images')
        .getPublicUrl(filePath);

      setAttachedImage(publicUrl);
      toast.success("Imagem carregada com sucesso!", { id: "upload-image" });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao fazer upload da imagem", { id: "upload-image" });
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSend = async () => {
    if ((!prompt.trim() && !attachedImage) || isLoading) return;

    // 🔄 CRITICAL: Reload latest HTML from database before editing
    if (isEditing && id) {
      try {
        const pages = await aiPagesService.getAll();
        const page = pages.find(p => p.id === id);
        if (page?.html_content) {
          console.log("🔄 Recarregando HTML atualizado do banco antes de editar");
          setGeneratedHtml(page.html_content);
        }
      } catch (error) {
        console.error("Erro ao recarregar HTML:", error);
      }
    }

    // Mensagem que será exibida no chat (sem o caminho da imagem)
    const displayMessage = attachedImage 
      ? (prompt || "Insira a imagem na página")
      : prompt;

    // Mensagem que será enviada para a IA (com o caminho da imagem)
    const aiMessage = attachedImage 
      ? `${prompt || "Insira a imagem na página"}\n\nCAMINHO DA IMAGEM: ${attachedImage}`
      : prompt;

    const userMessage: Message = { 
      role: "user", 
      content: displayMessage // Mostra apenas o texto no chat
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    const currentImageUrl = attachedImage;
    setAttachedImage(null);
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
      
      // If editing, add a MORE SPECIFIC and shorter context with FULL HTML
      if (isEditing && generatedHtml) {
        console.log("🔧 MODO EDIÇÃO - Enviando HTML completo atualizado");
        
        // Send FULL current HTML so AI has complete context
        apiMessages.splice(apiMessages.length - 1, 0, {
          role: "system",
          content: `🔧 MODO EDIÇÃO PONTUAL 🔧

HTML ATUAL COMPLETO (use este como base):
${generatedHtml}

⚠️ INSTRUÇÕES ABSOLUTAS:
1. Identifique EXATAMENTE o elemento mencionado pelo usuário
2. Faça SOMENTE a alteração específica pedida (texto, cor, imagem, etc)
3. Copie TODO o resto do HTML EXATAMENTE como está acima
4. NÃO recrie a página do zero
5. NÃO mude o design ou estrutura existente
6. Retorne o HTML completo com APENAS a modificação solicitada`
        });
      }
      
      console.log("📤 Enviando mensagens para IA:", apiMessages.length, "mensagens");

      await streamCreatePage({
        messages: apiMessages,
        onDelta: updateContent,
        onDone: async () => {
          setIsLoading(false);
          
          // Clean HTML before saving
          const cleanHtml = htmlContent
            .replace(/HTML_END.*$/s, '')
            .replace(/HTML_START/g, '')
            .replace(/\*{3,}/g, '')
            .replace(/```html\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();
          
          // Auto-save when editing using the local variables
          if (isEditing && id && cleanHtml && currentTitle && currentSlug) {
            try {
              await aiPagesService.update(id, {
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
          toast.error(error);
          setMessages((prev) => prev.slice(0, -1));
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error("Erro ao processar requisição");
    }
  };

  const handleSavePage = async () => {
    if (!pageTitle.trim() || !pageSlug.trim() || !generatedHtml.trim()) {
      toast.error("Preencha o título, slug e certifique-se de ter uma página gerada");
      return;
    }

    // Clean HTML before saving
    const cleanHtml = generatedHtml
      .replace(/HTML_END.*$/s, '')
      .replace(/HTML_START/g, '')
      .replace(/\*{3,}/g, '')
      .replace(/```html\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    setIsSaving(true);
    try {
      if (isEditing && id) {
        await aiPagesService.update(id, {
          title: pageTitle,
          slug: pageSlug,
          html_content: cleanHtml,
          ...pageSettings,
        });
        toast.success("Página atualizada com sucesso!");
      } else {
        await aiPagesService.create({
          title: pageTitle,
          slug: pageSlug,
          html_content: cleanHtml,
          ...pageSettings,
        });
        toast.success("Página salva com sucesso!");
      }
      navigate("/link-ai");
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("duplicate")) {
        toast.error("Este slug já existe. Escolha outro.");
      } else {
        toast.error(isEditing ? "Erro ao atualizar página" : "Erro ao salvar página");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="container mx-auto p-6 max-w-7xl flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" onClick={() => navigate("/link-ai")}>
          ← Voltar
        </Button>
        {generatedHtml && (
          <PageSettingsDialog
            settings={pageSettings}
            onSave={(settings) => {
              setPageSettings(settings);
              toast.success("Configurações salvas!");
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat */}
        <Card className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
          <CardHeader className="border-b border-border">
            <CardTitle>{isEditing ? "Editar com IA" : "Chat com IA"}</CardTitle>
            <CardDescription>
              {isEditing ? "Descreva as alterações que deseja fazer" : "Descreva sua página e converse com a IA"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        onChange={(e) => setPageTitle(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page-slug" className="text-xs">
                        Slug (URL)
                      </Label>
                      <Input
                        id="page-slug"
                        placeholder="minha-pagina"
                        value={pageSlug}
                        onChange={(e) =>
                          setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSavePage}
                    disabled={isSaving}
                    className="w-full gradient-instagram text-white"
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditing ? "Atualizando..." : "Salvando..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? "Atualizar Página" : "Salvar Página"}
                      </>
                    )}
                  </Button>
                </div>
              )}
              {attachedImage && (
                <div className="relative inline-block">
                  <img src={attachedImage} alt="Anexo" className="h-20 w-20 object-cover rounded-lg border border-border" />
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
                    placeholder="Descreva sua página ou anexe uma imagem..."
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
                    accept="image/*"
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
                  title="Anexar imagem"
                >
                  <ImagePlus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || (!prompt.trim() && !attachedImage)}
                  className="gradient-instagram text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Pressione Enter para enviar</p>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Divisor Redimensionável (apenas desktop) */}
        <div 
          className="w-1 bg-border hover:bg-primary/20 cursor-col-resize transition-colors flex items-center justify-center group"
          onMouseDown={handleMouseDown}
          style={{ 
            backgroundColor: isResizing ? 'rgb(var(--primary) / 0.3)' : undefined 
          }}
        >
          {/* Indicador visual do divisor */}
          <div className="w-1 h-12 bg-muted-foreground/20 rounded-full group-hover:bg-primary/40 transition-colors" />
        </div>

        {/* Preview Panel */}
        <div 
          className="flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <Card className="flex flex-col h-full">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview da Página</CardTitle>
                <CardDescription>Visualize sua página em tempo real</CardDescription>
              </div>
              {generatedHtml && id && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/${pageSlug}`, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir Página
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
          <CardContent className="flex-1 bg-muted/30 p-0 overflow-hidden relative">
            {isVisualEditMode && id ? (
              <div className="absolute inset-0 z-10 bg-background">
                <InlineVisualEditor
                  pageId={id}
                  initialHtml={generatedHtml}
                  onSave={() => {
                    setIsVisualEditMode(false);
                    loadPage(id);
                  }}
                />
              </div>
            ) : generatedHtml ? (
              <iframe
                srcDoc={generatedHtml}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full gradient-instagram flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Loader2 className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-muted-foreground">Aguardando criação da página...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Layout Mobile (tela cheia sem redimensionamento) */}
      <div className="lg:hidden space-y-6">
        {/* Chat Section for Mobile */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar com IA" : "Chat com IA"}</CardTitle>
            <CardDescription>
              {isEditing ? "Descreva as alterações que deseja fazer" : "Descreva sua página e converse com a IA"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
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

            {generatedHtml && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="page-title-mobile" className="text-xs">
                      Título da Página
                    </Label>
                    <Input
                      id="page-title-mobile"
                      placeholder="Minha Página"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="page-slug-mobile" className="text-xs">
                      Slug (URL)
                    </Label>
                    <Input
                      id="page-slug-mobile"
                      placeholder="minha-pagina"
                      value={pageSlug}
                      onChange={(e) =>
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      className="h-8"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSavePage}
                  disabled={isSaving}
                  className="w-full gradient-instagram text-white"
                  size="sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? "Atualizando..." : "Salvando..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? "Atualizar Página" : "Salvar Página"}
                    </>
                  )}
                </Button>
              </div>
            )}

            {attachedImage && (
              <div className="relative inline-block">
                <img src={attachedImage} alt="Anexo" className="h-20 w-20 object-cover rounded-lg border border-border" />
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
                  placeholder="Descreva sua página ou anexe uma imagem..."
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
                  accept="image/*"
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
                title="Anexar imagem"
              >
                <ImagePlus className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading || (!prompt.trim() && !attachedImage)}
                className="gradient-instagram text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Pressione Enter para enviar</p>
          </CardContent>
        </Card>

        {/* Preview Section for Mobile */}
        {generatedHtml && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview da Página</CardTitle>
                  <CardDescription>Visualize sua página em tempo real</CardDescription>
                </div>
                {id && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${pageSlug}`, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVisualEditMode(true)}
                      className="gap-2"
                    >
                      <Palette className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 bg-muted/30 overflow-hidden relative">
                {isVisualEditMode && id ? (
                  <div className="absolute inset-0 z-10 bg-background">
                    <InlineVisualEditor
                      pageId={id}
                      initialHtml={generatedHtml}
                      onSave={() => {
                        setIsVisualEditMode(false);
                        loadPage(id);
                      }}
                    />
                  </div>
                ) : (
                  <iframe
                    srcDoc={generatedHtml}
                    className="w-full h-full border-0"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
