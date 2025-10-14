import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';

interface CaktoCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  checkoutUrl: string;
  onSuccess?: () => void;
}

export default function CaktoCheckoutModal({
  open,
  onClose,
  checkoutUrl,
  onSuccess
}: CaktoCheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setError(null);
      
      // Se for desktop, abrir em nova aba automaticamente
      if (!isMobile) {
        window.open(checkoutUrl, '_blank');
        onClose();
        return;
      }
    }
  }, [open, isMobile, checkoutUrl, onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Erro ao carregar o checkout. Tente novamente.');
  };

  const handleOpenInNewTab = () => {
    window.open(checkoutUrl, '_blank');
    onClose();
  };

  // Escutar mensagens do iframe para detectar conclusão do pagamento
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar se a mensagem vem do domínio da Cakto
      if (event.origin !== 'https://pay.cakto.com.br') {
        return;
      }

      // Verificar se é uma mensagem de pagamento concluído
      if (event.data?.type === 'payment_completed' || event.data?.type === 'checkout_completed') {
        console.log('✅ Pagamento concluído via Cakto');
        onSuccess?.();
        onClose();
      }
    };

    if (open && isMobile) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [open, isMobile, onSuccess, onClose]);

  if (!checkoutUrl) {
    return null;
  }

  // Se for desktop, não renderizar nada (já abriu em nova aba)
  if (!isMobile) {
    return null;
  }

  // Mobile: Modal iframe com espaçamentos e bordas arredondadas
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-[calc(100vw-32px)] h-[calc(100vh-32px)] p-0 mx-auto my-4 rounded-t-3xl rounded-b-none border-0 shadow-2xl">
        {/* Botão de fechar - apenas no mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-white shadow-lg rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-full bg-white rounded-t-3xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando checkout...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center h-full bg-white rounded-t-3xl">
            <div className="text-center p-4">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleOpenInNewTab} variant="outline">
                Abrir em nova aba
              </Button>
            </div>
          </div>
        )}

        {/* Iframe - com bordas arredondadas no topo */}
        <iframe
          src={checkoutUrl}
          className={`w-full h-full border-0 rounded-t-3xl ${isLoading || error ? 'hidden' : 'block'}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Checkout Cakto"
          allow="payment"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />
      </DialogContent>
    </Dialog>
  );
}