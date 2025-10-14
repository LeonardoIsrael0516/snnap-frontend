import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Copy, 
  Check, 
  Clock, 
  QrCode,
  Shield,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE';
  referenceId: string;
  description?: string;
}

export default function PixModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  type,
  referenceId,
  description
}: PixModalProps) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeImage: string;
    pixCopyPaste: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const createPixPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/payments/create-pix`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            type,
            referenceId,
            amount,
            description
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento PIX');
      }

      const data = await response.json();
      console.log('📱 Dados PIX recebidos:', {
        hasQrCode: !!data.qrCode,
        hasQrCodeImage: !!data.qrCodeImage,
        qrCodeLength: data.qrCode?.length,
        qrCodeImageLength: data.qrCodeImage?.length
      });
      
      setPixData({
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        pixCopyPaste: data.pixCopyPaste,
        expiresAt: data.expiresAt
      });

      // Calcular tempo restante (3600 segundos = 1 hora)
      const expiresInSeconds = 3600; // 1 hora de expiração padrão
      setTimeLeft(expiresInSeconds);

      toast.success('QR Code PIX gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast.error('Erro ao gerar QR Code PIX');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Criar pagamento quando modal abrir
  useEffect(() => {
    if (isOpen && !pixData) {
      createPixPayment();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden h-[95vh] md:h-auto md:max-h-[95vh] flex flex-col md:rounded-lg rounded-t-3xl rounded-b-none">
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white flex-shrink-0 md:rounded-t-lg rounded-t-3xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Pagamento PIX
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="mt-4">
              <div className="text-3xl font-bold">{formatPrice(amount)}</div>
              <div className="text-green-100 text-sm mt-1">Aprovação instantânea</div>
            </div>
          </div>

          {/* Conteúdo - Scrollable */}
          <div className="p-6 flex-1 overflow-y-auto md:rounded-b-lg rounded-b-none min-h-0">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-green-500" />
                    </motion.div>
                    <span className="text-lg font-medium">Gerando QR Code...</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Aguarde enquanto preparamos seu pagamento
                  </p>
                </motion.div>
              ) : pixData ? (
                <motion.div
                  key="pix-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Timer */}
                  {timeLeft > 0 && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Expira em {formatTime(timeLeft)}</span>
                      </div>
                    </div>
                  )}

                  {/* Layout Desktop: Horizontal */}
                  <div className="hidden md:grid md:grid-cols-2 md:gap-8">
                    {/* QR Code - Lado Esquerdo */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white text-center">QR Code</h3>
                      <Card className="border-2 border-dashed border-gray-200">
                        <CardContent className="p-6 text-center">
                          {pixData.qrCodeImage ? (
                            <div className="space-y-4">
                              <img
                                src={pixData.qrCodeImage}
                                alt="QR Code PIX"
                                className="mx-auto border rounded-lg shadow-sm w-full max-w-[200px]"
                                onLoad={() => console.log('✅ QR Code carregado com sucesso')}
                                onError={(e) => console.error('❌ Erro ao carregar QR Code:', e)}
                              />
                              <p className="text-sm text-gray-600">
                                Escaneie o QR Code com seu app de pagamento
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                                <QrCode className="w-16 h-16 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">
                                QR Code será exibido aqui
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Código PIX - Lado Direito */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Código PIX</h3>
                      
                      {/* Código Copia e Cola */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Copia e Cola
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={pixData.pixCopyPaste}
                            readOnly
                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono text-gray-900 pr-12"
                          />
                          <Button
                            onClick={() => copyToClipboard(pixData.pixCopyPaste)}
                            size="sm"
                            className="absolute top-1 right-1 h-8 w-8 p-0"
                            variant={copied ? "default" : "outline"}
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Instruções */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
                        <ol className="text-sm text-blue-800 space-y-1">
                          <li>1. Abra seu app de pagamento</li>
                          <li>2. Escolha a opção PIX</li>
                          <li>3. Escaneie o QR Code ou cole o código</li>
                          <li>4. Confirme o pagamento</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Layout Mobile: Vertical */}
                  <div className="md:hidden space-y-6">
                    {/* QR Code */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white text-center">QR Code</h3>
                      <Card className="border-2 border-dashed border-gray-200">
                        <CardContent className="p-6 text-center">
                          {pixData.qrCodeImage ? (
                            <div className="space-y-4">
                              <img
                                src={pixData.qrCodeImage}
                                alt="QR Code PIX"
                                className="mx-auto border rounded-lg shadow-sm w-full max-w-[200px]"
                                onLoad={() => console.log('✅ QR Code carregado com sucesso')}
                                onError={(e) => console.error('❌ Erro ao carregar QR Code:', e)}
                              />
                              <p className="text-sm text-gray-600">
                                Escaneie o QR Code com seu app de pagamento
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                                <QrCode className="w-16 h-16 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">
                                QR Code será exibido aqui
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Código PIX */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Código PIX</h3>
                      
                      {/* Código Copia e Cola */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Copia e Cola
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={pixData.pixCopyPaste}
                            readOnly
                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono text-gray-900 pr-12"
                          />
                          <Button
                            onClick={() => copyToClipboard(pixData.pixCopyPaste)}
                            size="sm"
                            className="absolute top-1 right-1 h-8 w-8 p-0"
                            variant={copied ? "default" : "outline"}
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Instruções */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
                        <ol className="text-sm text-blue-800 space-y-1">
                          <li>1. Abra seu app de pagamento</li>
                          <li>2. Escolha a opção PIX</li>
                          <li>3. Escaneie o QR Code ou cole o código</li>
                          <li>4. Confirme o pagamento</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Informações de segurança */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">Pagamento PIX Seguro</span>
              </div>
              <p className="text-xs text-gray-500">
                Seus dados estão protegidos com criptografia de ponta a ponta
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
