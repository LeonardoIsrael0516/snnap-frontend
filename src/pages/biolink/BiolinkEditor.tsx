import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { BiolinkConfigTab } from "@/components/biolink/BiolinkConfigTab";
import { BiolinkBlocksTab } from "@/components/biolink/BiolinkBlocksTab";
import { BlockRenderer } from "@/components/biolink/BlockRenderer";
import { BiolinkSettings, BiolinkBlock } from "@/lib/biolinkBlocks";
import { biolinksService } from "@/lib/biolinks";
import { generateRandomGradient } from "@/lib/gradientGenerator";

export default function BiolinkEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Gerar gradiente aleatório para novos biolinks
  const getDefaultBackground = () => {
    if (id) {
      // Biolink existente - usar valores padrão
      return { 
        type: 'color' as const, 
        value: '#ffffff',
        gradientFrom: '#667eea',
        gradientTo: '#764ba2',
        gradientType: 'linear' as const,
        gradientDirection: 'to right'
      };
    } else {
      // Novo biolink - usar gradiente aleatório
      const randomGradient = generateRandomGradient();
      return {
        type: 'gradient' as const,
        value: '', // Não usado para gradientes
        gradientFrom: randomGradient.fromColor,
        gradientTo: randomGradient.toColor,
        gradientMiddle: randomGradient.middleColor,
        gradientType: randomGradient.type,
        gradientDirection: randomGradient.direction
      };
    }
  };

  const [settings, setSettings] = useState<BiolinkSettings>({
    slug: location.state?.slug || '',
    pageTitle: '',
    background: getDefaultBackground(),
    pixels: {},
    customCode: ''
  });
  const [blocks, setBlocks] = useState<BiolinkBlock[]>([]);
  const [activeTab, setActiveTab] = useState('blocks');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewBiolink, setIsNewBiolink] = useState(!id);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadBiolink();
    } else if (isNewBiolink && !hasAutoSaved && settings.slug.trim()) {
      // Para novos biolinks, salvar automaticamente após um pequeno delay
      const autoSaveTimer = setTimeout(() => {
        console.log('🔄 Auto-salvando novo biolink...');
        handleSave();
        setHasAutoSaved(true);
      }, 2000); // 2 segundos de delay

      return () => clearTimeout(autoSaveTimer);
    }
  }, [id, isNewBiolink, hasAutoSaved, settings.slug]);

  // Auto-save quando blocos são modificados (apenas para biolinks existentes)
  useEffect(() => {
    if (id && !isNewBiolink && blocks.length > 0) {
      const autoSaveTimer = setTimeout(async () => {
        console.log('🔄 Auto-salvando mudanças nos blocos...');
        setIsAutoSaving(true);
        await handleSave(false); // false = sem notificação
        setIsAutoSaving(false);
      }, 1000); // 1 segundo de delay para mudanças nos blocos

      return () => clearTimeout(autoSaveTimer);
    }
  }, [blocks, id, isNewBiolink]);

  const loadBiolink = async () => {
    try {
      setIsLoading(true);
      const biolink = await biolinksService.getById(id!);
      if (biolink) {
        // Mapear dados do backend para o formato esperado pelo frontend
        setSettings({
          slug: biolink.slug, // Slug vem do nível raiz do backend
          pageTitle: biolink.settings?.pageTitle || biolink.settings?.title || '',
          ...biolink.settings, // Outras configurações do settings
        });
        setBlocks(biolink.blocks || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar biolink");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (showNotification = true) => {
    if (!settings.slug.trim()) {
      toast.error("Por favor, insira um slug");
      return;
    }

    try {
      setIsLoading(true);
      console.log('💾 Salvando biolink com dados:', { 
        id, 
        slug: settings.slug, 
        pageTitle: settings.pageTitle,
        settingsKeys: Object.keys(settings),
        blocksCount: blocks.length,
        blocksTypes: blocks.map(b => b.type)
      });
      
      if (id) {
        const updatedBiolink = await biolinksService.update(id, { 
          slug: settings.slug,
          settings, 
          blocks 
        });
        console.log('✅ Biolink atualizado, dados retornados:', updatedBiolink);
        
        // NÃO atualizar o estado local - deixar o usuário manter as mudanças
        // O estado já está correto, não precisa ser sobrescrito
        
        if (showNotification) {
          toast.success("Biolink atualizado com sucesso!");
        }
      } else {
        console.log('🆕 Criando novo biolink com gradiente:', settings.background);
        const newBiolink = await biolinksService.create({ slug: settings.slug, settings, blocks });
        toast.success("Biolink criado e salvo automaticamente!");
        
        // Atualizar a URL para incluir o ID do biolink criado
        if (newBiolink && newBiolink.id) {
          setIsNewBiolink(false);
          navigate(`/biolink/editor/${newBiolink.id}`, { replace: true });
        }
      }
    } catch (error: any) {
      console.error(error);
      if (showNotification) {
        toast.error(error.message || "Erro ao salvar biolink");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (!settings.slug) {
      toast.error("Insira um slug antes de visualizar");
      return;
    }
    // Abrir direto no microserviço biolink com timestamp para forçar atualização
    const timestamp = Date.now();
    window.open(`http://localhost:3003/${settings.slug}?v=${timestamp}`, '_blank');
  };

  const getBackgroundStyle = () => {
    const bg = settings.background;
    let style: React.CSSProperties = {};

    switch (bg.type) {
      case 'color':
        style.backgroundColor = bg.value;
        break;
      case 'gradient':
        const gradientType = bg.gradientType || 'linear';
        const gradientDirection = bg.gradientDirection || 'to right';
        
        if (bg.gradientFrom && bg.gradientTo) {
          let colors = [bg.gradientFrom];
          if (bg.gradientMiddle) {
            colors = [bg.gradientFrom, bg.gradientMiddle, bg.gradientTo];
          } else {
            colors = [bg.gradientFrom, bg.gradientTo];
          }

          const colorStops = colors.map((color, index) => {
            if (bg.gradientMiddle && colors.length === 3) {
              const positions = ['0%', '50%', '100%'];
              return `${color} ${positions[index]}`;
            } else {
              const positions = ['0%', '100%'];
              return `${color} ${positions[index]}`;
            }
          }).join(', ');

          switch (gradientType) {
            case 'linear':
              style.background = `linear-gradient(${gradientDirection}, ${colorStops})`;
              break;
            case 'radial':
              style.background = `radial-gradient(${gradientDirection}, ${colorStops})`;
              break;
            case 'conic':
              style.background = `conic-gradient(${gradientDirection}, ${colorStops})`;
              break;
            default:
              style.background = `linear-gradient(${gradientDirection}, ${colorStops})`;
          }
        } else if (bg.value && bg.value.startsWith('#')) {
          // Fallback para gradiente simples baseado na cor
          style.background = `linear-gradient(135deg, ${bg.value} 0%, ${bg.value}dd 100%)`;
        } else {
          style.background = bg.value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        break;
      case 'image':
        style.backgroundImage = `url(${bg.value})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        style.backgroundRepeat = 'no-repeat';
        break;
      case 'video':
        // Video background would need special handling
        break;
    }

    // Para cor sólida, aplicar blur no elemento principal se configurado
    if (bg.blur && bg.blur > 0 && bg.type === 'color') {
      console.log('🔍 Preview - Aplicando filter blur para cor sólida:', bg.blur);
      style.filter = `blur(${bg.blur}px)`;
    }

    return style;
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/link-ai')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Editor de Biolink</h1>
            <p className="text-xs text-muted-foreground">
              /{settings.slug || 'seu-slug'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isNewBiolink && hasAutoSaved && (
            <span className="text-sm text-green-600 font-medium">
              ✅ Salvo automaticamente
            </span>
          )}
          {isAutoSaving && (
            <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave} className="gradient-instagram text-white">
            <Save className="w-4 h-4 mr-2" />
            {isNewBiolink ? 'Salvar Manualmente' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Editor Panel */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <div className="h-full overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="blocks">Blocos</TabsTrigger>
                <TabsTrigger value="config">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="blocks" className="mt-0">
                <BiolinkBlocksTab
                  blocks={blocks}
                  onBlocksChange={setBlocks}
                />
              </TabsContent>

              <TabsContent value="config" className="mt-0">
                <BiolinkConfigTab
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="h-full bg-muted flex items-center justify-center p-8">
            <div className="relative">
              {/* Phone Frame */}
              <div 
                className="w-[375px] h-[667px] rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-gray-800 relative"
                style={getBackgroundStyle()}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-3xl z-10" />
                <div 
                  className="h-full overflow-y-auto p-6 pt-10"
                  style={settings.background?.blur && settings.background.blur > 0 && settings.background.type !== 'color' ? {
                    backdropFilter: `blur(${settings.background.blur}px)`,
                    WebkitBackdropFilter: `blur(${settings.background.blur}px)`
                  } : {}}
                >
                  <div className="space-y-4">
                    {blocks.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        Adicione blocos para visualizar
                      </div>
                    ) : (
                      blocks.map((block) => (
                        <div key={block.id}>
                          <BlockRenderer block={block} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
