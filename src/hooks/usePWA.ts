import { useState, useEffect } from 'react';

interface PWAConfig {
  enabled: boolean;
  name: string;
  shortName: string;
  description: string;
  iconUrl: string;
  themeColor: string;
  backgroundColor: string;
  displayMode: 'standalone' | 'minimal-ui' | 'fullscreen' | 'browser';
  startUrl: string;
  scope: string;
}

interface UsePWAReturn {
  isSupported: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  installPrompt: any;
  install: () => Promise<void>;
  checkInstallability: () => void;
}

export function usePWA(): UsePWAReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Verificar se PWA é suportado
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
    };

    // Verificar se já está instalado
    const checkInstalled = () => {
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
      setIsInstalled(installed);
    };

    // Verificar se pode instalar
    const checkInstallability = () => {
      if (installPrompt) {
        setCanInstall(true);
      }
    };

    checkSupport();
    checkInstalled();
    checkInstallability();

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    // Listener para appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };

    // Listener para mudanças no display mode
    const handleDisplayModeChange = () => {
      checkInstalled();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
    };
  }, [installPrompt]);

  const install = async (): Promise<void> => {
    if (!installPrompt) {
      throw new Error('PWA não pode ser instalado no momento');
    }

    try {
      const result = await installPrompt.prompt();
      console.log('PWA install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        console.log('PWA instalado com sucesso!');
      } else {
        console.log('PWA instalação cancelada pelo usuário');
      }
      
      setInstallPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      throw error;
    }
  };

  const checkInstallability = () => {
    if (installPrompt) {
      setCanInstall(true);
    }
  };

  return {
    isSupported,
    isInstalled,
    canInstall,
    installPrompt,
    install,
    checkInstallability,
  };
}

// Hook para detectar se está rodando como PWA
export function usePWADisplayMode(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };

    checkPWA();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkPWA();
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isPWA;
}

// Hook para gerenciar configurações PWA
export function usePWAConfig(initialConfig?: Partial<PWAConfig>) {
  const [config, setConfig] = useState<PWAConfig>({
    enabled: false,
    name: '',
    shortName: '',
    description: '',
    iconUrl: '',
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    displayMode: 'standalone',
    startUrl: '/',
    scope: '/',
    ...initialConfig,
  });

  const updateConfig = (updates: Partial<PWAConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig({
      enabled: false,
      name: '',
      shortName: '',
      description: '',
      iconUrl: '',
      themeColor: '#000000',
      backgroundColor: '#ffffff',
      displayMode: 'standalone',
      startUrl: '/',
      scope: '/',
    });
  };

  return {
    config,
    updateConfig,
    resetConfig,
  };
}

