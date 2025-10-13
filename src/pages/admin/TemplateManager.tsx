import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Eye, Tag, FolderPlus, Search, Folder, Star, Heart, Zap, Globe, 
  Palette, Camera, Music, Gamepad2, Book, Briefcase, Home, ShoppingBag, Car, Plane, 
  Coffee, Utensils, Gift, Trophy, Target, Lightbulb, Rocket, Diamond, Crown, Sparkles, 
  Flame, Snowflake, Sun, Moon, Cloud, TreePine, Flower, Leaf, Apple, Pizza, Cake, Wine, 
  Beer, Phone, Mail, MessageCircle, Users, User, UserPlus, Settings, Wrench, Hammer, 
  Scissors, Paintbrush, Pen, Pencil, Eraser, FileText, File, FolderOpen, Archive, 
  Download, Upload, Share, Link, Lock, Unlock, Shield, Key, Bell, Clock, Calendar, 
  MapPin, Navigation, Compass, Filter, Grid, List, EyeOff, Play, Pause, SkipBack, 
  SkipForward, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, Image, Images, Code, 
  Terminal, Database, Server, Cpu, HardDrive, Monitor, Laptop, Smartphone, Tablet, 
  Headphones, Speaker, Tv, Radio, Wifi, Bluetooth, Battery, BatteryCharging, Plug, 
  Power, X, Check, Minus, Copy, Save, RefreshCw, RotateCcw, RotateCw, Move, Maximize, 
  Minimize, ExternalLink, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronUp, 
  ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, MoreVertical, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getValidToken } from "@/lib/authService";
import { IconSelector } from "@/components/IconSelector";

interface Template {
  id: string;
  title: string;
  description: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  page: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string;
  };
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  _count: {
    templates: number;
  };
}

interface AIPage {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
}

// Função helper para obter o componente de ícone
const getIconComponent = (iconValue: string) => {
  const iconMap: { [key: string]: any } = {
    folder: Folder, star: Star, heart: Heart, zap: Zap, globe: Globe, palette: Palette,
    camera: Camera, music: Music, gamepad: Gamepad2, book: Book, briefcase: Briefcase,
    home: Home, shopping: ShoppingBag, car: Car, plane: Plane, coffee: Coffee,
    utensils: Utensils, gift: Gift, trophy: Trophy, target: Target, lightbulb: Lightbulb,
    rocket: Rocket, diamond: Diamond, crown: Crown, sparkles: Sparkles, flame: Flame,
    snowflake: Snowflake, sun: Sun, moon: Moon, cloud: Cloud, tree: TreePine,
    flower: Flower, leaf: Leaf, apple: Apple, pizza: Pizza, cake: Cake, wine: Wine,
    beer: Beer, phone: Phone, mail: Mail, message: MessageCircle, users: Users,
    user: User, "user-plus": UserPlus, settings: Settings, wrench: Wrench, hammer: Hammer,
    scissors: Scissors, paintbrush: Paintbrush, pen: Pen, pencil: Pencil, eraser: Eraser,
    "file-text": FileText, file: File, "folder-open": FolderOpen, archive: Archive,
    download: Download, upload: Upload, share: Share, link: Link, lock: Lock, unlock: Unlock,
    shield: Shield, key: Key, bell: Bell, clock: Clock, calendar: Calendar, "map-pin": MapPin,
    navigation: Navigation, compass: Compass, search: Search, filter: Filter,
    grid: Grid, list: List, eye: Eye, "eye-off": EyeOff, play: Play, pause: Pause,
    "skip-back": SkipBack, "skip-forward": SkipForward, volume: Volume2, "volume-x": VolumeX,
    mic: Mic, "mic-off": MicOff, video: Video, "video-off": VideoOff, image: Image, images: Images,
    code: Code, terminal: Terminal, database: Database, server: Server, cpu: Cpu,
    "hard-drive": HardDrive, monitor: Monitor, laptop: Laptop, smartphone: Smartphone,
    tablet: Tablet, headphones: Headphones, speaker: Speaker, tv: Tv, radio: Radio,
    wifi: Wifi, bluetooth: Bluetooth, battery: Battery, "battery-charging": BatteryCharging,
    plug: Plug, power: Power, trash: Trash2, x: X, check: Check, plus: Plus, minus: Minus,
    edit: Edit, copy: Copy, save: Save, refresh: RefreshCw, rotate: RotateCcw,
    move: Move, maximize: Maximize, minimize: Minimize, "external-link": ExternalLink,
    "arrow-up": ArrowUp, "arrow-down": ArrowDown, "arrow-left": ArrowLeft, "arrow-right": ArrowRight,
    "chevron-up": ChevronUp, "chevron-down": ChevronDown, "chevron-left": ChevronLeft,
    "chevron-right": ChevronRight, "more-horizontal": MoreHorizontal, "more-vertical": MoreVertical,
    menu: Menu
  };
  
  return iconMap[iconValue] || Folder; // Fallback para Folder se não encontrar
};

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [aiPages, setAiPages] = useState<AIPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Páginas disponíveis (sem template)
  const availablePages = aiPages.filter(
    page => !templates.some(template => template.page.id === page.id)
  );
  
  console.log('📊 Debug:');
  console.log('  - Total de páginas:', aiPages.length);
  console.log('  - Total de templates:', templates.length);
  console.log('  - Páginas disponíveis:', availablePages.length);
  console.log('  - IDs das páginas:', aiPages.map(p => p.id));
  console.log('  - IDs dos templates:', templates.map(t => t.page?.id));
  
  // Modal states
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "folder"
  });
  
  const [templateForm, setTemplateForm] = useState({
    pageId: "",
    categoryId: "",
    title: "",
    description: "",
    tags: [] as string[],
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTemplates(),
        loadCategories(),
        loadAiPages()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const token = await getValidToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/admin/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Templates carregados:', data);
        setTemplates(data);
      } else {
        console.error('❌ Erro ao carregar templates:', response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast.error("Erro ao carregar templates");
    }
  };

  const loadCategories = async () => {
    try {
      const token = await getValidToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/admin/template-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  };

  const loadAiPages = async () => {
    try {
      const token = await getValidToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/ai-pages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Páginas AI carregadas:', data);
        setAiPages(data);
      } else {
        console.error('❌ Erro ao carregar páginas:', response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar páginas:", error);
      toast.error("Erro ao carregar páginas");
    }
  };

  const handleCreateCategory = async () => {
    try {
      const token = await getValidToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/admin/template-categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        toast.success("Categoria criada com sucesso!");
        setCreateCategoryOpen(false);
        setCategoryForm({ name: "", description: "", icon: "folder" });
        loadCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar categoria");
      }
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria");
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const token = await getValidToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/admin/templates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(templateForm)
      });

      if (response.ok) {
        toast.success("Template criado com sucesso!");
        setCreateTemplateOpen(false);
        setTemplateForm({
          pageId: "",
          categoryId: "",
          title: "",
          description: "",
          tags: [],
          isActive: true
        });
        loadTemplates();
      } else {
        const error = await response.json();
        if (response.status === 400 && error.error?.includes("Já existe")) {
          toast.error("Esta página já possui um template. Escolha outra página.");
        } else {
          toast.error(error.error || "Erro ao criar template");
        }
      }
    } catch (error) {
      console.error("Erro ao criar template:", error);
      toast.error("Erro ao criar template");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

    try {
      const token = await getValidToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/template-categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Categoria deletada com sucesso!");
        loadCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao deletar categoria");
      }
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      toast.error("Erro ao deletar categoria");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Tem certeza que deseja deletar este template?")) return;

    try {
      const token = await getValidToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Template deletado com sucesso!");
        loadTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao deletar template");
      }
    } catch (error) {
      console.error("Erro ao deletar template:", error);
      toast.error("Erro ao deletar template");
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciador de Templates</h1>
        <p className="text-muted-foreground">
          Gerencie categorias e templates para o InspireBox
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Templates Header */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Selecione uma página existente para transformar em template
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pageId">Página</Label>
                    <Select value={templateForm.pageId} onValueChange={(value) => {
                      const page = availablePages.find(p => p.id === value);
                      setTemplateForm(prev => ({
                        ...prev,
                        pageId: value,
                        title: page?.title || ""
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder={availablePages.length === 0 ? "Nenhuma página disponível" : "Selecione uma página"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePages.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Todas as páginas já possuem templates
                          </div>
                        ) : (
                          availablePages.map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoria</Label>
                    <Select value={templateForm.categoryId} onValueChange={(value) => 
                      setTemplateForm(prev => ({ ...prev, categoryId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => {
                          const IconComponent = getIconComponent(category.icon);
                          return (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Template</Label>
                    <Input
                      id="title"
                      value={templateForm.title}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Portfólio Moderno"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o template..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={templateForm.isActive}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Template ativo (visível no InspireBox)</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setCreateTemplateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Criar Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                  {(() => {
                    const hasThumbnail = template.page.thumbnail_url && template.page.thumbnail_url !== '/placeholder.svg';
                    const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                    const fullPreviewUrl = `${linkAiUrl}/${template.page.slug}`;
                    
                    return hasThumbnail ? (
                      <>
                        <img
                          src={template.page.thumbnail_url}
                          alt={template.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
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
                    );
                  })()}
                  
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const linkAiUrl = import.meta.env.VITE_LINK_AI_API_URL?.replace('/api', '') || 'http://localhost:3002';
                        window.open(`${linkAiUrl}/${template.page.slug}`, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {!template.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Inativo</Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                      <div className="flex items-center gap-1">
                        {(() => {
                          const IconComponent = getIconComponent(template.category.icon);
                          return <IconComponent className="w-3 h-3" />;
                        })()}
                        {template.category.name}
                      </div>
                    </Badge>
                    {template.isActive && (
                      <Badge variant="default" className="bg-green-500">
                        Ativo
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground">
                Crie seu primeiro template ou ajuste os filtros de busca
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Categories Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categorias de Templates</h2>
            <Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                  <DialogDescription>
                    Crie uma nova categoria para organizar os templates
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Categoria</Label>
                    <Input
                      id="name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Portfólios"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva a categoria..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Ícone</Label>
                    <IconSelector
                      value={categoryForm.icon}
                      onChange={(icon) => setCategoryForm(prev => ({ ...prev, icon }))}
                      placeholder="Selecione um ícone"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setCreateCategoryOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCategory}>
                    Criar Categoria
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComponent = getIconComponent(category.icon);
                        return <IconComponent className="w-6 h-6" />;
                      })()}
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>
                          {category._count?.templates || 0} templates
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground">
                Crie sua primeira categoria para organizar os templates
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
