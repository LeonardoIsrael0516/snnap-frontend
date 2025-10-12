import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PixCheckoutProps {
  amount: number;
  type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE';
  referenceId: string;
  onSuccess: () => void;
}

interface PixData {
  paymentId: string;
  txid: string;
  qrCode: string;
  qrCodeImage: string;
  expiresAt: string;
}

export function PixCheckout({ amount, type, referenceId, onSuccess }: PixCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Timer para expiração
  useEffect(() => {
    if (!pixData) return;

    const expiresAt = new Date(pixData.expiresAt).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        toast.error('Pix expirado. Gere um novo código.');
        setPixData(null);
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [pixData, pollingInterval]);

  const generatePix = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_PAYMENTS_API_URL}/pix/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, type, referenceId })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar Pix');
      }

      const result = await response.json();
      if (result.success) {
        setPixData(result.data);
        startPaymentPolling(result.data.txid);
        toast.success('QR Code Pix gerado com sucesso!');
      } else {
        throw new Error(result.error || 'Erro ao gerar Pix');
      }
    } catch (error: any) {
      console.error('Erro ao gerar Pix:', error);
      toast.error(error.message || 'Erro ao gerar Pix');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentPolling = (txid: string) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_PAYMENTS_API_URL}/pix/status/${txid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.status === 'PAID') {
            toast.success('Pagamento confirmado!');
            clearInterval(interval);
            onSuccess();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 5000);

    setPollingInterval(interval);
  };

  const copyPixCode = () => {
    if (!pixData) return;
    
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    toast.success('Código Pix copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Cleanup do polling quando componente desmonta
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  if (!pixData) {
    return (
      <div className="text-center py-8">
        <Button onClick={generatePix} disabled={loading} size="lg">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gerar QR Code Pix
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          O Pix é processado instantaneamente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer de expiração */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Expira em: {formatTime(timeLeft)}</span>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <img 
          src={pixData.qrCodeImage} 
          alt="QR Code Pix" 
          className="w-64 h-64 border rounded-lg"
        />
      </div>
      
      {/* Código Copia e Cola */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Ou copie o código Pix:
        </p>
        <div className="flex gap-2">
          <input 
            readOnly 
            value={pixData.qrCode}
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted font-mono"
          />
          <Button onClick={copyPixCode} variant="outline" size="sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Aguardando pagamento...</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Esta página será atualizada automaticamente quando o pagamento for confirmado.
        </p>
      </div>

      {/* Botão para gerar novo Pix */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => {
            if (pollingInterval) clearInterval(pollingInterval);
            setPixData(null);
          }}
        >
          Gerar Novo Pix
        </Button>
      </div>
    </div>
  );
}
