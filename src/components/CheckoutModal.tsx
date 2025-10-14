import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Copy, 
  Check, 
  Clock, 
  Loader2,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  generatePaymentToken, 
  validateCardData, 
  formatCardNumber, 
  formatCVV, 
  formatCPF, 
  formatExpiryDate,
  detectCardBrand,
  useEfiSDK
} from '@/lib/efi-sdk';
import { SdkTest } from './SdkTest';

// Função para obter headers de autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE';
  referenceId: string;
  amount: number;
  title: string;
  description: string;
  onSuccess?: (paymentId: string) => void;
}

interface CardData {
  number: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  name: string;
  cpf: string;
  phone?: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  type,
  referenceId,
  amount,
  title,
  description,
  onSuccess
}: CheckoutModalProps) {
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    name: '',
    cpf: ''
  });
  
  // Hook do SDK Efí
  const { isLoaded: sdkLoaded, isLoading: sdkLoading, error: sdkError } = useEfiSDK();

  // Timer para PIX
  useEffect(() => {
    if (pixData && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, pixData]);

  // Formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Criar pagamento PIX
  const createPixPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/payments/create-pix`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type,
          referenceId,
          amount
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento PIX');
      }

      const data = await response.json();
      setPixData(data);
      setTimeLeft(3600); // 1 hora
      
      toast({
        title: "PIX criado com sucesso!",
        description: "Escaneie o QR Code ou copie o código para pagar.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o pagamento PIX.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar pagamento cartão
  const createCardPayment = async () => {
    setLoading(true);
    try {
      // Validar dados do cartão
      const validation = validateCardData(cardData);
      if (!validation.valid) {
        toast({
          title: "Dados inválidos",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }
      
      let paymentToken: string;
      
      if (sdkLoaded) {
        // Usar SDK da Efí para tokenização real
        paymentToken = await generatePaymentToken({
          ...cardData,
          brand: detectCardBrand(cardData.number),
          name: cardData.name || 'João Silva', // Nome com pelo menos duas palavras
          cpf: cardData.cpf || '11144477735' // CPF válido para testes
        });
      } else {
        // Fallback para token simulado
        console.warn('SDK Efí não carregado, usando token simulado');
        paymentToken = `simulated_token_${Date.now()}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/payments/create-card`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type,
          referenceId,
          amount,
          cardData: {
            paymentToken,
            customer: {
              name: cardData.name,
              email: 'user@example.com', // Pegar do contexto do usuário
              cpf: cardData.cpf,
              phone_number: cardData.phone || '11999999999' // Telefone obrigatório
            }
          },
          description: title
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      const data = await response.json();
      
      toast({
        title: "Pagamento processado!",
        description: "Seu pagamento foi aprovado com sucesso.",
      });

      onSuccess?.(data.paymentId);
      onClose();
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : "Não foi possível processar o pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copiar código PIX
  const copyPixCode = async () => {
    if (pixData?.pixCopyPaste) {
      await navigator.clipboard.writeText(pixData.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Código copiado!",
        description: "Cole no seu app de pagamento.",
      });
    }
  };

  // Verificar status do pagamento
  const checkPaymentStatus = async () => {
    if (!pixData?.paymentId) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/payments/${pixData.paymentId}/status`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.status === 'PAID') {
        toast({
          title: "Pagamento confirmado!",
          description: "Seu pagamento foi processado com sucesso.",
        });
        onSuccess?.(pixData.paymentId);
        onClose();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Finalizar Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pix' | 'card')}>
            {/* Debug SDK - Remover em produção */}
            <div className="mb-4">
              <SdkTest />
            </div>

            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                PIX
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão
              </TabsTrigger>
            </TabsList>

            {/* PIX Tab */}
            <TabsContent value="pix" className="space-y-4">
              {!pixData ? (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Pagamento via PIX</h3>
                  <p className="text-muted-foreground mb-4">
                    Pague instantaneamente com PIX. Aprovação imediata!
                  </p>
                  <Button 
                    onClick={createPixPayment} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando PIX...
                      </>
                    ) : (
                      'Gerar PIX'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Timer */}
                  {timeLeft > 0 && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        Expira em: {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}

                  {/* QR Code */}
                  {pixData.qrCodeImage && (
                    <div className="text-center">
                      <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <img 
                          src={pixData.qrCodeImage} 
                          alt="QR Code PIX" 
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Escaneie o QR Code com seu app de pagamento
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Código Copia e Cola */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Código PIX (Copia e Cola)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={pixData.pixCopyPaste || ''} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copyPixCode}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={checkPaymentStatus}
                      variant="outline"
                      className="flex-1"
                    >
                      Verificar Pagamento
                    </Button>
                    <Button 
                      onClick={() => {
                        setPixData(null);
                        setTimeLeft(0);
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Cartão Tab */}
            <TabsContent value="card" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: formatCVV(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Mês</Label>
                    <Input
                      id="expiryMonth"
                      placeholder="12"
                      value={cardData.expirationMonth}
                      onChange={(e) => setCardData({...cardData, expirationMonth: e.target.value.replace(/\D/g, '').substring(0, 2)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Ano</Label>
                    <Input
                      id="expiryYear"
                      placeholder="2025"
                      value={cardData.expirationYear}
                      onChange={(e) => setCardData({...cardData, expirationYear: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome no Cartão</Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="123.456.789-01"
                    value={cardData.cpf}
                    onChange={(e) => setCardData({...cardData, cpf: formatCPF(e.target.value)})}
                  />
                </div>

                <Button 
                  onClick={createCardPayment}
                  disabled={loading || !cardData.number || !cardData.cvv || !cardData.name}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Pagar ${formatCurrency(amount)}`
                  )}
                </Button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    <span>Seus dados são protegidos com criptografia SSL</span>
                  </div>
                  
                  {/* Status do SDK Efí */}
                  {sdkLoading && (
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Carregando sistema de pagamento...</span>
                    </div>
                  )}
                  
                  {sdkError && (
                    <div className="flex items-center gap-2 text-xs text-orange-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Usando modo de desenvolvimento</span>
                    </div>
                  )}
                  
                  {sdkLoaded && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Check className="h-3 w-3" />
                      <span>Sistema de pagamento carregado</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}