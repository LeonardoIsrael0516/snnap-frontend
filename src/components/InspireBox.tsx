import { useState, useEffect } from "react";
import { X, Search, Download, Eye, Tag } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getValidToken } from "@/lib/authService";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  thumbnail: string;
  previewUrl: string;
  tags: string[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  templateCount: number;
}

interface InspireBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportTemplate: (templateId: string) => void;
}

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Folder; // fallback to Folder icon
};

export function InspireBox({ open, onOpenChange, onImportTemplate }: InspireBoxProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTemplates();
      loadCategories();
    }
  }, [open]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        console.error("Erro ao carregar templates:", response.statusText);
        toast.error("Erro ao carregar templates");
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/template-categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error("Erro ao carregar categorias:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleImportTemplate = async (templateId: string, templateTitle: string) => {
    try {
      // Verificar créditos antes de importar (opcional)
      const creditsResponse = await fetch(`/api/user/check-credits?required=1&action=importação`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      let hasCredits = false;
      if (creditsResponse.ok) {
        const data = await creditsResponse.json();
        hasCredits = data.hasCredits;
        
        if (!hasCredits) {
          console.log("💰 Usuário não tem créditos, mas permitindo importação gratuita");
        } else {
          console.log("💰 Usuário tem créditos, será cobrado pela importação");
        }
      } else {
        console.log("⚠️ Erro ao verificar créditos, permitindo importação");
      }

      setImportingId(templateId);
      
      // Gerar slug único baseado no título do template
      const baseSlug = templateTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const timestamp = Date.now();
      const title = `${templateTitle}`;
      const slug = `${baseSlug}-${timestamp}`;
      
      const token = await getValidToken();
      
      const url = `${import.meta.env.VITE_API_BASE_URL}/templates/${templateId}/import`;
      console.log('🔍 URL da requisição:', url);
      console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('🔍 VITE_LINK_AI_API_URL:', import.meta.env.VITE_LINK_AI_API_URL);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, slug })
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      console.log('🔍 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Response data:', data);
        toast.success("✅ Template importado com sucesso!", {
          description: `A página "${title}" foi criada na sua conta`
        });
        onOpenChange(false);
        // Chamar callback para atualizar a lista de páginas
        await onImportTemplate(templateId);
      } else {
        console.log('🔍 Error response status:', response.status);
        const responseText = await response.text();
        console.log('🔍 Error response text:', responseText);
        
        try {
          const error = JSON.parse(responseText);
          toast.error("❌ Erro ao importar template", {
            description: error.error || "Tente novamente mais tarde"
          });
        } catch (parseError) {
          console.error('🔍 Erro ao fazer parse do JSON:', parseError);
          toast.error("❌ Erro ao importar template", {
            description: "Resposta inválida do servidor"
          });
        }
      }
    } catch (error) {
      console.error("Erro ao importar template:", error);
      toast.error("❌ Erro ao importar template", {
        description: "Verifique sua conexão e tente novamente"
      });
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-7xl p-0 md:p-6 overflow-hidden">
        {/* Header */}
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-0">
          <DialogTitle className="text-2xl font-bold gradient-instagram-text">
            InspireBox
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Escolha um template e comece a criar sua página
          </p>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col" style={{ height: 'calc(90vh - 80px)' }}>
          {/* Categories */}
          <div className="border-b bg-background flex-shrink-0">
            <div className="p-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria">
                    {(() => {
                      const selected = categories.find(cat => cat.id === selectedCategory);
                      if (selected) {
                        const IconComponent = getIconComponent(selected.icon);
                        return (
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{selected.name}</span>
                          </div>
                        );
                      }
                      return "Todas as categorias";
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>Todas as categorias</span>
                    </div>
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComponent = getIconComponent(category.icon);
                          return <IconComponent className="w-4 h-4" />;
                        })()}
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {category.templateCount}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates */}
          <div className="flex-1 overflow-y-scroll" style={{ maxHeight: 'calc(90vh - 160px)' }}>
            <div className="p-4 w-full max-w-full">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4 w-full max-w-full">
                  {filteredTemplates.map((template) => {
                    const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                    const fullPreviewUrl = `${linkAiUrl}${template.previewUrl}`;
                    const hasThumbnail = template.thumbnail && template.thumbnail !== '/placeholder.svg';
                    
                    return (
                      <Card key={template.id} className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 w-full max-w-full overflow-hidden">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted w-full">
                          {hasThumbnail ? (
                            <>
                              <img
                                src={template.thumbnail}
                                alt={template.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                            </>
                          ) : (
                            <>
                              <iframe 
                                src={fullPreviewUrl}
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                style={{ overflow: 'hidden' }}
                                title={`Preview de ${template.title}`}
                                scrolling="no"
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                            </>
                          )}

                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(fullPreviewUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {template.category}
                          </Badge>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1 mb-4">
                            {template.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.tags.length - 2}
                              </Badge>
                            )}
                          </div>

                          <Button
                            onClick={() => handleImportTemplate(template.id, template.title)}
                            className="w-full gradient-instagram text-white hover:opacity-90"
                            disabled={importingId !== null}
                          >
                            {importingId === template.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Importando...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Importar
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-64 border-r bg-muted/30">
            <div className="p-4">
              <h3 className="font-semibold mb-3">Categorias</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {(() => {
                      const IconComponent = getIconComponent(category.icon);
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.templateCount} templates
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-full">
                    {filteredTemplates.map((template) => {
                      // Gerar URL completa de preview
                      const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                      const fullPreviewUrl = `${linkAiUrl}${template.previewUrl}`;
                      const hasThumbnail = template.thumbnail && template.thumbnail !== '/placeholder.svg';
                      
                      return (
                        <Card key={template.id} className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                          <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                            {hasThumbnail ? (
                              <>
                                <img
                                  src={template.thumbnail}
                                  alt={template.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                              </>
                            ) : (
                              <>
                                <iframe 
                                  src={fullPreviewUrl}
                                  className="absolute inset-0 w-full h-full pointer-events-none"
                                  style={{ overflow: 'hidden' }}
                                  title={`Preview de ${template.title}`}
                                  scrolling="no"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                              </>
                            )}
                            
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.open(fullPreviewUrl, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {template.category}
                            </Badge>
                          </div>
                          
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-1 mb-4">
                              {template.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button
                              onClick={() => handleImportTemplate(template.id, template.title)}
                              className="w-full gradient-instagram text-white hover:opacity-90"
                              disabled={importingId !== null}
                            >
                              {importingId === template.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Importando...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Importar Template
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {!isLoading && filteredTemplates.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar sua busca ou selecionar outra categoria
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}