import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ImageUpload';
import { PWAOnboarding } from '@/components/PWAOnboarding';
import { toast } from 'sonner';
import { Smartphone, Palette, Upload, Settings, HelpCircle, Crown } from 'lucide-react';
import { authenticatedFetch } from '@/lib/authService';
import PWAUpgradeModal from './PWAUpgradeModal';

interface PWASettingsProps {
  page: {
    id: string;
    title: string;
    slug: string;
    pwaEnabled?: boolean;
    pwaName?: string;
    pwaShortName?: string;
    pwaDescription?: string;
    pwaIconUrl?: string;
    pwaThemeColor?: string;
    pwaBackgroundColor?: string;
    pwaDisplayMode?: string;
    pwaStartUrl?: string;
    pwaScope?: string;
    pwaShowInstallPrompt?: boolean;
  };
  onUpdate: (updates: any) => Promise<void>;
}

export function PWASettings({ page, onUpdate }: PWASettingsProps) {
  const [pwaEnabled, setPwaEnabled] = useState(page.pwaEnabled || false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(page.pwaShowInstallPrompt !== false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPermissions, setUserPermissions] = useState<{pwaEnabled: boolean} | null>(null);
  const [showPWAUpgradeModal, setShowPWAUpgradeModal] = useState(false);
  const [pwaConfig, setPwaConfig] = useState({
    name: page.pwaName || page.title,
    shortName: page.pwaShortName || page.title.slice(0, 12),
    description: page.pwaDescription || '',
    iconUrl: page.pwaIconUrl || '',
    themeColor: page.pwaThemeColor || '#000000',
    backgroundColor: page.pwaBackgroundColor || '#ffffff',
    displayMode: page.pwaDisplayMode || 'standalone',
    startUrl: page.pwaStartUrl || `/${page.slug}`,
    scope: page.pwaScope || `/${page.slug}/`,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Carregar permissões do usuário
  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        console.log('🔍 PWA: Carregando permissões do usuário...');
        const response = await authenticatedFetch('http://localhost:3001/api/user/permissions');
        if (response.ok) {
          const permissions = await response.json();
          console.log('🔍 PWA: Permissões carregadas:', permissions);
          console.log('🔍 PWA: pwaEnabled:', permissions.pwaEnabled);
          setUserPermissions(permissions);
        } else {
          console.error('❌ PWA: Erro na resposta:', response.status);
        }
      } catch (error) {
        console.error('❌ PWA: Erro ao carregar permissões:', error);
      }
    };

    loadUserPermissions();
  }, []);

  // Função helper para salvar
  const saveSettings = async (updates: any) => {
    setIsSaving(true);
    try {
      console.log('🔧 PWA: Enviando atualizações:', updates);
      await onUpdate(updates);
      console.log('✅ PWA: Atualizações enviadas com sucesso');
      toast.success('Configurações PWA salvas!');
    } catch (error) {
      console.error('❌ PWA: Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações PWA');
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar automaticamente quando desativar PWA
  const handlePwaEnabledChange = async (enabled: boolean) => {
    console.log('🔍 PWA: handlePwaEnabledChange chamado');
    console.log('🔍 PWA: enabled:', enabled);
    console.log('🔍 PWA: userPermissions:', userPermissions);
    console.log('🔍 PWA: userPermissions.pwaEnabled:', userPermissions?.pwaEnabled);
    
    // Se está tentando ativar o PWA, verificar permissões
    if (enabled && userPermissions && !userPermissions.pwaEnabled) {
      console.log('🚫 PWA: Usuário não tem permissão para PWA, abrindo modal de upgrade');
      setShowPWAUpgradeModal(true);
      return;
    }
    
    console.log('✅ PWA: Usuário tem permissão para PWA, prosseguindo...');

    setPwaEnabled(enabled);
    
    // Salvar imediatamente
    await saveSettings({
      pwaEnabled: enabled,
      pwaName: pwaConfig.name,
      pwaShortName: pwaConfig.shortName,
      pwaDescription: pwaConfig.description,
      pwaIconUrl: pwaConfig.iconUrl,
      pwaThemeColor: pwaConfig.themeColor,
      pwaBackgroundColor: pwaConfig.backgroundColor,
      pwaDisplayMode: pwaConfig.displayMode,
      pwaStartUrl: pwaConfig.startUrl,
      pwaScope: pwaConfig.scope,
      pwaShowInstallPrompt: showInstallPrompt,
    });
  };

  // Salvar automaticamente quando desativar prompt
  const handleShowInstallPromptChange = async (show: boolean) => {
    const previousValue = showInstallPrompt;
    setShowInstallPrompt(show);
    
    console.log(`🔔 PWA Frontend: ${show ? 'Ativando' : 'Desativando'} prompt de instalação...`);
    console.log('🔔 PWA Frontend: Valor recebido no toggle:', show);
    console.log('🔔 PWA Frontend: Tipo do valor:', typeof show);
    
    // Salvar imediatamente
    setIsSaving(true);
    try {
      const updates = {
        pwaEnabled,
        pwaName: pwaConfig.name,
        pwaShortName: pwaConfig.shortName,
        pwaDescription: pwaConfig.description,
        pwaIconUrl: pwaConfig.iconUrl,
        pwaThemeColor: pwaConfig.themeColor,
        pwaBackgroundColor: pwaConfig.backgroundColor,
        pwaDisplayMode: pwaConfig.displayMode,
        pwaStartUrl: pwaConfig.startUrl,
        pwaScope: pwaConfig.scope,
        pwaShowInstallPrompt: show,
      };
      
      console.log('🔔 PWA Frontend: Objeto completo a ser enviado:', updates);
      console.log('🔔 PWA Frontend: pwaShowInstallPrompt no objeto:', updates.pwaShowInstallPrompt, 'tipo:', typeof updates.pwaShowInstallPrompt);
      
      await onUpdate(updates);
      console.log('✅ PWA Frontend: Prompt de instalação salvo automaticamente');
      toast.success(show ? 'Prompt de instalação ativado!' : 'Prompt de instalação desativado!');
    } catch (error) {
      console.error('❌ PWA Frontend: Erro ao salvar prompt:', error);
      toast.error('Erro ao salvar configuração do prompt');
      // Reverter em caso de erro
      setShowInstallPrompt(previousValue);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        pwaEnabled,
        pwaName: pwaConfig.name,
        pwaShortName: pwaConfig.shortName,
        pwaDescription: pwaConfig.description,
        pwaIconUrl: pwaConfig.iconUrl,
        pwaThemeColor: pwaConfig.themeColor,
        pwaBackgroundColor: pwaConfig.backgroundColor,
        pwaDisplayMode: pwaConfig.displayMode,
        pwaStartUrl: pwaConfig.startUrl,
        pwaScope: pwaConfig.scope,
        pwaShowInstallPrompt: showInstallPrompt,
      };
      
      console.log('🔧 PWA: Enviando atualizações:', updates);
      await onUpdate(updates);
      console.log('✅ PWA: Atualizações enviadas com sucesso');
      toast.success('Configurações PWA salvas com sucesso!');
    } catch (error) {
      console.error('❌ PWA: Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações PWA');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setPwaConfig(prev => ({ ...prev, iconUrl: url }));
  };

  return (
    <>
      <PWAOnboarding 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>PWA (App Nativo)</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOnboarding(true)}
                    className="h-6 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    O que é PWA?
                  </Button>
                </div>
                <CardDescription>
                  Transforme sua página em um app instalável
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={pwaEnabled}
                onCheckedChange={handlePwaEnabledChange}
                disabled={isSaving}
              />
              {userPermissions && !userPermissions.pwaEnabled && (
                <div className="flex items-center justify-center w-6 h-6 text-amber-600 bg-amber-50 rounded-full">
                  <Crown className="w-3 h-3" />
                </div>
              )}
            </div>
        </div>
        
        {pwaEnabled && (
          <div className="px-6 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Prompt Automático de Instalação</Label>
                <p className="text-xs text-gray-500">Mostrar mensagem automática para instalar o app após 3 segundos</p>
              </div>
              <Switch 
                checked={showInstallPrompt}
                onCheckedChange={handleShowInstallPromptChange}
                disabled={isSaving}
              />
            </div>
            
            {showInstallPrompt && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2 font-medium">Preview do Banner:</p>
                <div className="bg-white rounded-xl shadow-lg p-4 flex items-start gap-3">
                  {pwaConfig.iconUrl ? (
                    <img 
                      src={pwaConfig.iconUrl} 
                      alt="App Icon" 
                      className="flex-shrink-0 w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${pwaConfig.themeColor}, ${pwaConfig.backgroundColor})` 
                      }}
                    >
                      <Smartphone className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Instalar {pwaConfig.shortName || pwaConfig.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      Tenha acesso rápido e use offline
                    </p>
                    <div className="flex gap-2">
                      <div 
                        className="flex-1 text-white text-xs font-medium py-2 px-3 rounded-lg text-center"
                        style={{ background: pwaConfig.themeColor }}
                      >
                        Instalar Agora
                      </div>
                      <div className="text-gray-600 text-xs font-medium py-2 px-3 rounded-lg border border-gray-300">
                        Agora não
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      {pwaEnabled && (
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Informações do App
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pwa-name">Nome do App *</Label>
                <Input
                  id="pwa-name"
                  value={pwaConfig.name}
                  onChange={(e) => setPwaConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Meu App Incrível"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pwa-short-name">Nome Curto *</Label>
                <Input
                  id="pwa-short-name"
                  value={pwaConfig.shortName}
                  onChange={(e) => setPwaConfig(prev => ({ ...prev, shortName: e.target.value }))}
                  placeholder="MeuApp"
                  maxLength={12}
                />
                <p className="text-xs text-gray-500">
                  {pwaConfig.shortName.length}/12 caracteres
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pwa-description">Descrição</Label>
              <Textarea
                id="pwa-description"
                value={pwaConfig.description}
                onChange={(e) => setPwaConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Uma descrição breve do seu app..."
                rows={3}
              />
            </div>
          </div>

          {/* Visual e Cores */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Visual e Cores
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ícone do App (512x512px)</Label>
                <ImageUpload
                  value={pwaConfig.iconUrl}
                  onChange={handleImageUpload}
                  folder="pwa-icons"
                  label="Ícone PWA"
                  description="Recomendado: 512x512px, formato PNG"
                />
                {pwaConfig.iconUrl && (
                  <div className="flex items-center gap-2 mt-2">
                    <img 
                      src={pwaConfig.iconUrl} 
                      alt="PWA Icon Preview" 
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <span className="text-sm text-gray-600">Preview do ícone</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pwa-theme-color">Cor do Tema</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pwa-theme-color"
                      type="color"
                      value={pwaConfig.themeColor}
                      onChange={(e) => setPwaConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={pwaConfig.themeColor}
                      onChange={(e) => setPwaConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pwa-bg-color">Cor de Fundo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pwa-bg-color"
                      type="color"
                      value={pwaConfig.backgroundColor}
                      onChange={(e) => setPwaConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={pwaConfig.backgroundColor}
                      onChange={(e) => setPwaConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações Avançadas
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pwa-display-mode">Modo de Exibição</Label>
                <Select
                  value={pwaConfig.displayMode}
                  onValueChange={(value) => setPwaConfig(prev => ({ ...prev, displayMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modo de exibição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standalone">App Completo (recomendado)</SelectItem>
                    <SelectItem value="minimal-ui">Minimal (barra de endereço mínima)</SelectItem>
                    <SelectItem value="fullscreen">Tela Cheia</SelectItem>
                    <SelectItem value="browser">Navegador (padrão)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Como o app será exibido quando instalado
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pwa-start-url">URL de Início</Label>
                  <Input
                    id="pwa-start-url"
                    value={pwaConfig.startUrl}
                    onChange={(e) => setPwaConfig(prev => ({ ...prev, startUrl: e.target.value }))}
                    placeholder="/minha-pagina"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pwa-scope">Escopo</Label>
                  <Input
                    id="pwa-scope"
                    value={pwaConfig.scope}
                    onChange={(e) => setPwaConfig(prev => ({ ...prev, scope: e.target.value }))}
                    placeholder="/minha-pagina/"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview e Ações */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex gap-3">
              <Button 
                onClick={handleSave}
                disabled={isSaving || !pwaConfig.name || !pwaConfig.shortName}
                className="flex-1"
              >
                {isSaving ? 'Salvando...' : 'Salvar Configurações PWA'}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
      </Card>

      {/* Modal de Upgrade de PWA */}
      <PWAUpgradeModal
        open={showPWAUpgradeModal}
        onOpenChange={setShowPWAUpgradeModal}
        onPlanSelected={(planId) => {
          console.log('Plano selecionado para PWA:', planId);
          setShowPWAUpgradeModal(false);
        }}
      />
    </>
  );
}
