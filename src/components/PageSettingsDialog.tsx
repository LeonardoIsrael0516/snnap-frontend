import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Search, BarChart3, Code, Share2, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "./ImageUpload";
import { PWASettings } from "./PWASettings";

interface PageSettings {
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
}

interface PageSettingsDialogProps {
  settings: PageSettings;
  onSave: (settings: PageSettings) => void;
}

export function PageSettingsDialog({ settings, onSave }: PageSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<PageSettings>(settings);
  const [open, setOpen] = useState(false);
  const [showPWAModal, setShowPWAModal] = useState(false);

  const handleSave = () => {
    onSave(localSettings);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurações da Página</DialogTitle>
              <DialogDescription>
                Configure SEO, favicon e metadados da sua página
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="seo" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="seo" className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="opengraph" className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="pixels" className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Pixels
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  Código
                </TabsTrigger>
              </TabsList>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon</Label>
                    <ImageUpload
                      value={localSettings.favicon_url || ""}
                      onChange={(url) => setLocalSettings({ ...localSettings, favicon_url: url })}
                      folder="favicons"
                      label="Favicon"
                      description="Ícone que aparece na aba do navegador (16x16px ou 32x32px)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-title">Título da Página</Label>
                    <Input
                      id="meta-title"
                      placeholder="Título que aparece nos resultados de busca"
                      value={localSettings.meta_title || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, meta_title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Descrição</Label>
                    <Textarea
                      id="meta-description"
                      placeholder="Descrição que aparece nos resultados de busca"
                      value={localSettings.meta_description || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, meta_description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Palavras-chave</Label>
                    <Input
                      id="keywords"
                      placeholder="palavra1, palavra2, palavra3"
                      value={localSettings.keywords || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, keywords: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonical-url">URL Canônica</Label>
                    <Input
                      id="canonical-url"
                      placeholder="https://exemplo.com/pagina"
                      value={localSettings.canonical_url || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, canonical_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="robots">Robots</Label>
                    <Select
                      value={localSettings.robots || "index,follow"}
                      onValueChange={(value) => setLocalSettings({ ...localSettings, robots: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index,follow">Indexar e seguir links</SelectItem>
                        <SelectItem value="index,nofollow">Indexar mas não seguir links</SelectItem>
                        <SelectItem value="noindex,follow">Não indexar mas seguir links</SelectItem>
                        <SelectItem value="noindex,nofollow">Não indexar nem seguir links</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="opengraph" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="og-title">Título do Open Graph</Label>
                    <Input
                      id="og-title"
                      placeholder="Título que aparece quando compartilhado no Facebook/LinkedIn"
                      value={localSettings.og_title || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, og_title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og-description">Descrição do Open Graph</Label>
                    <Textarea
                      id="og-description"
                      placeholder="Descrição que aparece quando compartilhado"
                      value={localSettings.og_description || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, og_description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og-image">Imagem do Open Graph</Label>
                    <ImageUpload
                      value={localSettings.og_image || ""}
                      onChange={(url) => setLocalSettings({ ...localSettings, og_image: url })}
                      folder="og-images"
                      label="Imagem Social"
                      description="Imagem que aparece quando compartilhado (1200x630px recomendado)"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pixels" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="google-analytics">Google Analytics</Label>
                    <Input
                      id="google-analytics"
                      placeholder="G-XXXXXXXXXX"
                      value={localSettings.google_analytics || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, google_analytics: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-tag-manager">Google Tag Manager</Label>
                    <Input
                      id="google-tag-manager"
                      placeholder="GTM-XXXXXXX"
                      value={localSettings.google_tag_manager || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, google_tag_manager: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook-pixel">Facebook Pixel</Label>
                    <Input
                      id="facebook-pixel"
                      placeholder="123456789012345"
                      value={localSettings.facebook_pixel || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, facebook_pixel: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok-pixel">TikTok Pixel</Label>
                    <Input
                      id="tiktok-pixel"
                      placeholder="CXXXXXXXXXXXXXXX"
                      value={localSettings.tiktok_pixel || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, tiktok_pixel: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin-pixel">LinkedIn Pixel</Label>
                    <Input
                      id="linkedin-pixel"
                      placeholder="1234567"
                      value={localSettings.linkedin_pixel || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, linkedin_pixel: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter-pixel">Twitter Pixel</Label>
                    <Input
                      id="twitter-pixel"
                      placeholder="o0abc123def456"
                      value={localSettings.twitter_pixel || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, twitter_pixel: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-head">HTML no &lt;head&gt;</Label>
                    <Textarea
                      id="custom-head"
                      placeholder="<!-- Adicione meta tags, links ou scripts aqui -->
<meta name='author' content='Seu Nome'>
<link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'>"
                      value={localSettings.custom_head || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, custom_head: e.target.value })}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">HTML adicional será inserido no &lt;head&gt;</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-body">HTML no &lt;body&gt;</Label>
                    <Textarea
                      id="custom-body"
                      placeholder="<!-- Adicione elementos HTML aqui -->
<div class='custom-banner'>
  <p>Banner personalizado</p>
</div>"
                      value={localSettings.custom_body || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, custom_body: e.target.value })}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">HTML adicional será inserido no início do &lt;body&gt;</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-footer">HTML no final</Label>
                    <Textarea
                      id="custom-footer"
                      placeholder="<!-- Adicione scripts ou elementos no final -->
<script>
  console.log('Script personalizado carregado!');
</script>"
                      value={localSettings.custom_footer || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, custom_footer: e.target.value })}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">HTML adicional será inserido no final da página</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-css">CSS Customizado</Label>
                    <Textarea
                      id="custom-css"
                      placeholder="/* Adicione estilos CSS customizados aqui */
body {
  font-family: 'Arial', sans-serif;
}

.custom-class {
  color: #ff0000;
}"
                      value={localSettings.custom_css || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, custom_css: e.target.value })}
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">CSS será aplicado globalmente na página</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Configurações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowPWAModal(true)}
          className={`flex items-center gap-2 ${
            localSettings.pwa_enabled 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : ''
          }`}
        >
          <Smartphone className="w-4 h-4" />
          PWA
          {localSettings.pwa_enabled && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </Button>
      </div>
      
      {/* Modal PWA */}
      <Dialog open={showPWAModal} onOpenChange={setShowPWAModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Configurações PWA
            </DialogTitle>
            <DialogDescription>
              Transforme sua página em um app instalável com configurações personalizadas
            </DialogDescription>
          </DialogHeader>
          
          <PWASettings 
            page={{
              id: '', // Será preenchido pelo componente pai
              title: localSettings.meta_title || 'Página',
              slug: localSettings.slug || '',
              pwaEnabled: localSettings.pwa_enabled || false,
              pwaName: localSettings.pwa_name,
              pwaShortName: localSettings.pwa_short_name,
              pwaDescription: localSettings.pwa_description,
              pwaIconUrl: localSettings.pwa_icon_url,
              pwaThemeColor: localSettings.pwa_theme_color,
              pwaBackgroundColor: localSettings.pwa_background_color,
              pwaDisplayMode: localSettings.pwa_display_mode,
              pwaStartUrl: localSettings.pwa_start_url,
              pwaScope: localSettings.pwa_scope,
            }}
            onUpdate={(updates) => {
              console.log('🔧 PageSettingsDialog: Recebendo atualizações PWA:', updates);
              const newSettings = {
                ...localSettings,
                pwa_enabled: updates.pwaEnabled,
                pwa_name: updates.pwaName,
                pwa_short_name: updates.pwaShortName,
                pwa_description: updates.pwaDescription,
                pwa_icon_url: updates.pwaIconUrl,
                pwa_theme_color: updates.pwaThemeColor,
                pwa_background_color: updates.pwaBackgroundColor,
                pwa_display_mode: updates.pwaDisplayMode,
                pwa_start_url: updates.pwaStartUrl,
                pwa_scope: updates.pwaScope,
              };
              console.log('🔧 PageSettingsDialog: Novas configurações:', newSettings);
              setLocalSettings(newSettings);
              
              // Chamar onSave do componente pai para salvar no backend
              console.log('🔧 PageSettingsDialog: Chamando onSave do pai');
              onSave(newSettings);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}