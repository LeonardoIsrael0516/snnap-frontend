import React from 'react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { Download, Smartphone, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function PWAInstallButton({ 
  className, 
  variant = 'default', 
  size = 'default',
  showIcon = true,
  children 
}: PWAInstallButtonProps) {
  const { isSupported, isInstalled, canInstall, install } = usePWA();
  const [isInstalling, setIsInstalling] = React.useState(false);

  const handleInstall = async () => {
    if (!canInstall) {
      toast.error('PWA não pode ser instalado no momento');
      return;
    }

    setIsInstalling(true);
    try {
      await install();
      toast.success('App instalado com sucesso!');
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      toast.error('Erro ao instalar o app');
    } finally {
      setIsInstalling(false);
    }
  };

  // Se não é suportado, não mostrar o botão
  if (!isSupported) {
    return null;
  }

  // Se já está instalado, mostrar indicador
  if (isInstalled) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
      >
        {showIcon && <Check className="w-4 h-4 mr-2" />}
        {children || 'App Instalado'}
      </Button>
    );
  }

  // Se não pode instalar, não mostrar o botão
  if (!canInstall) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleInstall}
      disabled={isInstalling}
    >
      {showIcon && (
        isInstalling ? (
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )
      )}
      {children || (isInstalling ? 'Instalando...' : 'Instalar App')}
    </Button>
  );
}

// Componente de banner de instalação
export function PWAInstallBanner() {
  const { isSupported, isInstalled, canInstall } = usePWA();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Não mostrar se não é suportado, já instalado, não pode instalar ou foi dispensado
  if (!isSupported || isInstalled || !canInstall || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              Instalar App
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Instale este app para uma experiência melhor
            </p>
            
            <div className="flex gap-2 mt-3">
              <PWAInstallButton size="sm" className="flex-1">
                Instalar
              </PWAInstallButton>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="px-2"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de status PWA
export function PWAStatus() {
  const { isSupported, isInstalled, canInstall } = usePWA();
  const isPWA = usePWA();

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-500">
        PWA não suportado neste navegador
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <Check className="w-3 h-3" />
        <span>App instalado</span>
      </div>
    );
  }

  if (canInstall) {
    return (
      <div className="flex items-center gap-1 text-xs text-blue-600">
        <Download className="w-3 h-3" />
        <span>Pode instalar</span>
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-500">
      PWA disponível
    </div>
  );
}

