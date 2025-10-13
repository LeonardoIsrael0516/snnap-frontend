import { useState, useEffect } from "react";
import * as React from "react";
import { Download, Eye, Tag, Sparkles, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface FeaturedTemplatesProps {
  onImportTemplate: (templateId: string) => Promise<void>;
  onOpenInspireBox?: () => void;
}

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Folder; // fallback to Folder icon
};

export function FeaturedTemplates({ onImportTemplate, onOpenInspireBox }: FeaturedTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [currentTemplates, setCurrentTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const mobileScrollRef = React.useRef<HTMLDivElement>(null);
  const desktopScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  // Efeito para atualizar templates quando os dados carregam
  useEffect(() => {
    if (templates.length > 0 && categories.length > 0) {
      setCurrentTemplates(getRandomTemplates());
      setIsLoading(false);
    }
  }, [templates, categories]);

  // Efeito para rotacionar templates automaticamente com transição suave
  useEffect(() => {
    if (templates.length > 3) {
      const interval = setInterval(() => {
        // Mobile: Scroll suave lateral
        if (mobileScrollRef.current) {
          const scrollContainer = mobileScrollRef.current;
          const cardWidth = scrollContainer.scrollWidth / currentTemplates.length;
          const currentScroll = scrollContainer.scrollLeft;
          const nextScroll = currentScroll + cardWidth;
          
          // Se chegou ao final, volta pro início
          if (nextScroll >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainer.scrollTo({ left: nextScroll, behavior: 'smooth' });
          }
        }
        
        // Desktop: Scroll suave lateral também
        if (desktopScrollRef.current) {
          const scrollContainer = desktopScrollRef.current;
          const cardWidth = scrollContainer.scrollWidth / currentTemplates.length;
          const currentScroll = scrollContainer.scrollLeft;
          const nextScroll = currentScroll + cardWidth;
          
          // Se chegou ao final, volta pro início
          if (nextScroll >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainer.scrollTo({ left: nextScroll, behavior: 'smooth' });
          }
        }
      }, 5000); // Muda a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [templates, categories, currentTemplates]);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        console.error("Erro ao carregar templates:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
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

  // Pegar templates aleatórios (máximo 6 para desktop, 3 para mobile)
  const getRandomTemplates = () => {
    if (templates.length === 0) return [];
    
    // Embaralhar templates e pegar os primeiros 6
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(6, templates.length));
  };

  // Funções de drag para desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2; // Multiplica para scroll mais rápido
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  // Funções de navegação com setas
  const scrollToNext = () => {
    if (desktopScrollRef.current) {
      const scrollContainer = desktopScrollRef.current;
      const cardWidth = 320 + 24; // w-80 (320px) + gap-6 (24px)
      scrollContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const scrollToPrev = () => {
    if (desktopScrollRef.current) {
      const scrollContainer = desktopScrollRef.current;
      const cardWidth = 320 + 24; // w-80 (320px) + gap-6 (24px)
      scrollContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleImportTemplate = async (templateId: string, templateTitle: string) => {
    try {
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
      
      const response = await fetch(`/api/templates/${templateId}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, slug })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("✅ Template importado com sucesso!", {
          description: `A página "${title}" foi criada na sua conta`
        });
        // Chamar callback para atualizar a lista de páginas
        await onImportTemplate(templateId);
      } else {
        const error = await response.json();
        toast.error("❌ Erro ao importar template", {
          description: error.error || "Tente novamente mais tarde"
        });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentTemplates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Inspire-se
        </p>
      </div>

      {/* Templates - Mobile: Netflix carousel, Desktop: Draggable carousel */}
      <div>
        {/* Mobile: Netflix carousel */}
        <div className="md:hidden">
          <div 
            ref={mobileScrollRef}
            className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            {currentTemplates.map((template, index) => {
              const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
              const fullPreviewUrl = `${linkAiUrl}${template.previewUrl}`;
              const hasThumbnail = template.thumbnail && template.thumbnail !== '/placeholder.svg';
              
              return (
                <div 
                  key={`${template.id}-${index}`}
                  className="flex-shrink-0 w-[85vw] snap-center"
                >
                  <Card className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden h-full">
                    <div className="aspect-video relative overflow-hidden bg-muted">
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
                            className="absolute inset-0 w-full h-full pointer-events-none scale-50 origin-top-left"
                            style={{ width: '200%', height: '200%', overflow: 'hidden' }}
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
                      
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-black">
                          {(() => {
                            const category = categories.find(cat => cat.id === template.categoryId);
                            if (category) {
                              const IconComponent = getIconComponent(category.icon);
                              return (
                                <>
                                  <IconComponent className="w-3 h-3 mr-1" />
                                  {category.name}
                                </>
                              );
                            }
                            return template.category;
                          })()}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-1">{template.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
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
                            Usar Template
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: Draggable carousel centralizado com setas */}
        <div className="hidden md:block relative">
          {/* Seta esquerda */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
            onClick={scrollToPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Seta direita */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
            onClick={scrollToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="flex justify-center overflow-hidden">
            <div 
              ref={desktopScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none scroll-smooth px-4"
              style={{ maxWidth: 'calc(320px * 3 + 24px * 2 + 32px)' }} // 3 cards + 2 gaps + padding
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
            {currentTemplates.map((template, index) => {
          // Gerar URL completa de preview
          const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
          const fullPreviewUrl = `${linkAiUrl}${template.previewUrl}`;
          const hasThumbnail = template.thumbnail && template.thumbnail !== '/placeholder.svg';
          
          return (
            <div className="flex-shrink-0 w-80" key={`${template.id}-${index}`}>
              <Card 
                className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden h-full"
              >
              <div className="aspect-video relative overflow-hidden bg-muted">
                {hasThumbnail ? (
                  <>
                    <img
                      src={template.thumbnail}
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </>
                ) : (
                  <>
                    <iframe 
                      src={fullPreviewUrl}
                      className="absolute inset-0 w-full h-full pointer-events-none scale-50 origin-top-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      style={{ width: '200%', height: '200%', overflow: 'hidden' }}
                      title={`Preview de ${template.title}`}
                      scrolling="no"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                  </>
                )}
                
                {/* Overlay com botões */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(fullPreviewUrl, '_blank')}
                      className="backdrop-blur-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleImportTemplate(template.id, template.title)}
                      disabled={importingId !== null}
                      className="gradient-instagram text-white hover:opacity-90 backdrop-blur-sm"
                    >
                      {importingId === template.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Usar Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Badge da categoria */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-black">
                    {(() => {
                      const category = categories.find(cat => cat.id === template.categoryId);
                      if (category) {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {category.name}
                          </>
                        );
                      }
                      return template.category;
                    })()}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{template.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          );
        })}
        </div>
        </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center pt-4">
        <p className="text-muted-foreground mb-4">
          Quer ver mais opções? Explore nossa biblioteca completa de templates.
        </p>
        <Button 
          variant="outline" 
          className="hover-gradient"
          onClick={onOpenInspireBox}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Ver InspireBox
        </Button>
      </div>
    </div>
  );
}
