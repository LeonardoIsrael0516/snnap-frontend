import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BiolinkSettings } from "@/lib/biolinkBlocks";
import { BiolinkImageUpload } from "./BiolinkImageUpload";
import { AdvancedGradientPicker } from "./AdvancedGradientPicker";
import { PixelsManager } from "./PixelsManager";
import { Search, Share2, BarChart3, Code } from "lucide-react";

interface BiolinkConfigTabProps {
  settings: BiolinkSettings;
  onSettingsChange: (settings: BiolinkSettings) => void;
}

export function BiolinkConfigTab({ settings, onSettingsChange }: BiolinkConfigTabProps) {
  const updateSettings = (updates: Partial<BiolinkSettings>) => {
    console.log('🔄 BiolinkConfigTab - Atualizando settings:', { updates, currentSlug: settings.slug });
    onSettingsChange({ ...settings, ...updates });
  };

  const updateBackground = (updates: Partial<BiolinkSettings['background']>) => {
    onSettingsChange({
      ...settings,
      background: { ...settings.background, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            Social
          </TabsTrigger>
          <TabsTrigger value="pixels" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Pixels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Configurações Básicas</h3>
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="p-4">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={settings.slug}
                  onChange={(e) => updateSettings({ slug: e.target.value })}
                  placeholder="meu-biolink"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Acessível em: /{settings.slug}
                </p>
              </Card>

              <Card className="p-4">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={settings.pageTitle || ''}
                  onChange={(e) => updateSettings({ pageTitle: e.target.value })}
                  placeholder="Meu Biolink"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Título principal do biolink
                </p>
              </Card>
            </div>

            {/* Background Settings */}
            <Card className="p-4">
              <Label className="text-base font-medium mb-4 block">Fundo</Label>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Tipo de Fundo</Label>
                  <RadioGroup
                    value={settings.background?.type || 'color'}
                    onValueChange={(value) => updateBackground({ type: value as any })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="color" id="color" />
                      <Label htmlFor="color">Cor Sólida</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gradient" id="gradient" />
                      <Label htmlFor="gradient">Gradiente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image" />
                      <Label htmlFor="image">Imagem</Label>
                    </div>
                  </RadioGroup>
                </div>

                {settings.background?.type === 'color' && (
                  <div>
                    <Label htmlFor="background-color">Cor de Fundo</Label>
                    <Input
                      id="background-color"
                      type="color"
                      value={settings.background.value || '#ffffff'}
                      onChange={(e) => updateBackground({ value: e.target.value })}
                      className="mt-2 w-20 h-10"
                    />
                  </div>
                )}

                {settings.background?.type === 'gradient' && (
                  <div>
                    <Label>Gradiente Avançado</Label>
                    <AdvancedGradientPicker
                      gradientFrom={settings.background.gradientFrom || '#667eea'}
                      gradientTo={settings.background.gradientTo || '#764ba2'}
                      gradientMiddle={settings.background.gradientMiddle}
                      gradientType={settings.background.gradientType || 'linear'}
                      gradientDirection={settings.background.gradientDirection || 'to right'}
                      onFromColorChange={(value) => updateBackground({ gradientFrom: value })}
                      onToColorChange={(value) => updateBackground({ gradientTo: value })}
                      onMiddleColorChange={(value) => updateBackground({ gradientMiddle: value })}
                      onTypeChange={(value) => updateBackground({ gradientType: value })}
                      onDirectionChange={(value) => updateBackground({ gradientDirection: value })}
                      onRemoveMiddleColor={() => updateBackground({ gradientMiddle: undefined })}
                    />
                  </div>
                )}

                {settings.background?.type === 'image' && (
                  <div>
                    <Label>Imagem de Fundo</Label>
                    <BiolinkImageUpload
                      value={settings.background.value || ''}
                      onChange={(url) => updateBackground({ value: url })}
                      label="Imagem de Fundo"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Recomendado: 1920x1080px ou maior
                    </p>
                  </div>
                )}

                {/* Blur Effect */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="blur">Efeito de Desfoque</Label>
                    <span className="text-sm font-medium text-muted-foreground">
                      {settings.background?.blur || 0}px
                    </span>
                  </div>
                  <Slider
                    id="blur"
                    value={[settings.background?.blur || 0]}
                    onValueChange={([value]) => updateBackground({ blur: value })}
                    max={20}
                    step={1}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0px (sem desfoque)</span>
                    <span>20px (máximo)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Aplique um efeito de desfoque no fundo para melhorar a legibilidade do conteúdo
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={settings.metaTitle || ''}
                  onChange={(e) => updateSettings({ metaTitle: e.target.value })}
                  placeholder="Título para SEO"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Título otimizado para mecanismos de busca
                </p>
              </Card>

              <Card className="p-4">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={settings.metaDescription || ''}
                  onChange={(e) => updateSettings({ metaDescription: e.target.value })}
                  placeholder="Descrição para SEO"
                  className="mt-2"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Descrição otimizada para mecanismos de busca
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="space-y-4">
            {/* Favicon and OG Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <BiolinkImageUpload
                  value={settings.favicon || ''}
                  onChange={(url) => updateSettings({ favicon: url })}
                  label="Favicon"
                  maxSize={1024 * 1024} // 1MB para favicon
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ícone exibido na aba do navegador (recomendado: 32x32px)
                </p>
              </Card>

              <Card className="p-4">
                <BiolinkImageUpload
                  value={settings.ogImage || ''}
                  onChange={(url) => updateSettings({ ogImage: url })}
                  label="Imagem Open Graph"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Imagem exibida ao compartilhar nas redes sociais (recomendado: 1200x630px)
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <Label htmlFor="og-title">Open Graph Title</Label>
                <Input
                  id="og-title"
                  value={settings.ogTitle || ''}
                  onChange={(e) => updateSettings({ ogTitle: e.target.value })}
                  placeholder="Título para redes sociais"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Título exibido ao compartilhar nas redes sociais
                </p>
              </Card>

              <Card className="p-4">
                <Label htmlFor="og-description">Open Graph Description</Label>
                <Textarea
                  id="og-description"
                  value={settings.ogDescription || ''}
                  onChange={(e) => updateSettings({ ogDescription: e.target.value })}
                  placeholder="Descrição para redes sociais"
                  className="mt-2"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Descrição exibida ao compartilhar nas redes sociais
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pixels" className="space-y-4">
          <div className="space-y-4">
            <Card className="p-4">
              <PixelsManager
                pixels={settings.pixels || []}
                onPixelsChange={(pixels) => updateSettings({ pixels })}
              />
            </Card>

            <Card className="p-4">
              <Label htmlFor="custom-code">Código Personalizado</Label>
              <Textarea
                id="custom-code"
                value={settings.customCode || ''}
                onChange={(e) => updateSettings({ customCode: e.target.value })}
                placeholder="Insira aqui códigos HTML, CSS ou JavaScript personalizados..."
                className="mt-2"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Código será inserido antes do fechamento da tag &lt;/body&gt;
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}