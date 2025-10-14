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

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setError(null);
    }
  }, [open]);

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

    if (open) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [open, onSuccess, onClose]);

  if (!checkoutUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Checkout - Cakto</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="flex items-center space-x-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir em nova aba</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando checkout...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleOpenInNewTab} variant="outline">
                Abrir em nova aba
              </Button>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          src={checkoutUrl}
          className={`w-full flex-1 border-0 ${isLoading || error ? 'hidden' : 'block'}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Checkout Cakto"
          allow="payment"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
          <p>
            Processamento seguro via{' '}
            <a 
              href="https://cakto.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Cakto
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
