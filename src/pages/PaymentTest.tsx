import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Lock, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Declaração global para window.$gn
declare global {
  interface Window {
    $gn: any;
  }
}

const cardSchema = z.object({
  cardNumber: z.string().min(16, 'Número do cartão inválido'),
  cardName: z.string()
    .min(2, 'Nome no cartão é obrigatório')
    .refine((name) => name.trim().split(/\s+/).length >= 2, 'Nome deve conter pelo menos duas palavras'),
  expiryMonth: z.string().min(2, 'Mês inválido'),
  expiryYear: z.string().min(4, 'Ano inválido'),
  cvv: z.string().min(3, 'CVV inválido'),
  cpf: z.string().min(11, 'CPF inválido')
});

type CardFormData = z.infer<typeof cardSchema>;

export default function PaymentTest() {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema)
  });

  // Inicializar SDK da Efí com múltiplas tentativas
  useEffect(() => {
    const loadEfiSDK = async () => {
      const cdnUrls = [
        'https://sdk.efipay.com.br/v1/js/efi.js',
        'https://cobrancas-h.api.efipay.com.br/v1/js/efi.js',
        'https://tokenizer.sejaefi.com.br/js/efi.js',
        'https://cobrancas.api.efipay.com.br/v1/js/efi.js'
      ];

      for (const url of cdnUrls) {
        try {
          console.log(`🔍 Tentando carregar SDK da Efí de: ${url}`);
          
          const script = document.createElement('script');
          script.src = url;
          script.async = true;
          
          await new Promise((resolve, reject) => {
            script.onload = () => {
              console.log(`✅ Script carregado de: ${url}`);
              resolve(true);
            };
            script.onerror = () => {
              console.log(`❌ Falha ao carregar de: ${url}`);
              reject(new Error(`Falha ao carregar de ${url}`));
            };
            document.head.appendChild(script);
          });

          // Verificar se window.$gn está disponível
          if (window.$gn) {
            setSdkReady(true);
            setSdkError(null);
            console.log('✅ SDK da Efí carregado com sucesso');
            addTestResult('SDK Load', 'success', 'SDK da Efí carregado com sucesso');
            return;
          } else {
            console.log('⚠️ Script carregado mas window.$gn não está disponível');
          }
        } catch (error) {
          console.log(`❌ Erro ao carregar de ${url}:`, error);
          continue;
        }
      }

      // Se chegou aqui, nenhuma URL funcionou
      const errorMsg = 'Não foi possível carregar a SDK da Efí de nenhuma fonte. Usando modo fallback.';
      setSdkError(errorMsg);
      addTestResult('SDK Load', 'warning', errorMsg);
      console.warn('⚠️ Todas as tentativas de carregar a SDK falharam, usando modo fallback');
    };

    loadEfiSDK();
  }, []);

  const addTestResult = (test: string, status: 'success' | 'error' | 'info', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const detectCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\D/g, '');
    
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    
    return 'visa'; // default
  };

  const generateHexToken = (): string => {
    // Gerar token de 40 caracteres hexadecimais
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const onSubmit = async (data: CardFormData) => {
    setLoading(true);
    setProcessing(true);

    try {
      addTestResult('Form Validation', 'success', 'Dados do formulário validados');

      const apiUrl = import.meta.env.VITE_PAYMENTS_API_URL;
      
      if (!apiUrl) {
        throw new Error('VITE_PAYMENTS_API_URL não está definida');
      }

      addTestResult('API URL', 'success', `API URL: ${apiUrl}`);

      console.log('🔍 Iniciando processo de pagamento...');
      addTestResult('Payment Start', 'info', 'Iniciando processo de pagamento');

      let paymentToken: string;

      if (sdkReady && window.$gn) {
        console.log('🔍 Tokenizando cartão com SDK da Efí...');
        addTestResult('Tokenization', 'info', 'Tokenizando cartão com SDK da Efí');

        try {
          paymentToken = await new Promise<string>((resolve, reject) => {
            window.$gn.checkout.getPaymentToken({
              brand: detectCardBrand(data.cardNumber),
              number: data.cardNumber.replace(/\s/g, ''),
              cvv: data.cvv,
              expiration_month: data.expiryMonth,
              expiration_year: data.expiryYear
            }, (response: any) => {
              if (response.error) {
                reject(new Error(response.error_description || 'Erro na tokenização'));
              } else {
                resolve(response.payment_token);
              }
            });
          });

          addTestResult('Tokenization', 'success', `Token gerado: ${paymentToken.substring(0, 8)}...`);
          console.log('✅ Token gerado:', paymentToken);
        } catch (tokenError) {
          addTestResult('Tokenization', 'error', `Erro na tokenização: ${tokenError}`);
          throw tokenError;
        }
      } else {
        // Fallback: gerar token simulado
        console.log('⚠️ SDK não disponível, usando token simulado');
        addTestResult('Tokenization', 'warning', 'SDK não disponível, usando token simulado');
        paymentToken = generateHexToken();
      }

      console.log('🔍 Enviando pagamento para backend...');
      addTestResult('Backend Request', 'info', 'Enviando requisição para backend');
      
      // Teste de conectividade primeiro
      try {
        console.log('🔍 Testando conectividade com o microserviço...');
        const healthResponse = await fetch(`${apiUrl.replace('/api', '')}/health`);
        console.log('🔍 Health check status:', healthResponse.status);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('🔍 Health check data:', healthData);
          addTestResult('Connectivity', 'success', 'Conectividade com microserviço OK');
        } else {
          addTestResult('Connectivity', 'error', `Health check falhou: ${healthResponse.status}`);
        }
      } catch (healthError) {
        console.error('❌ Erro no health check:', healthError);
        addTestResult('Connectivity', 'error', `Erro de conectividade: ${healthError.message}`);
      }
      
      console.log('🔍 URL da requisição:', `${apiUrl}/card/create`);
      console.log('🔍 Headers da requisição:', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWducGdnbzUwMDA0MTBudnltb3NoaW54IiwiZW1haWwiOiJ0ZXN0ZUBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzYwMjkzMDE1LCJleHAiOjE3NjAzNzk0MTV9.pIkmkj4HWrzo1e4Sv8PzAqL16KW8aC_I9Hubt-6yU0A'
      });
      console.log('🔍 Dados da requisição:', {
        amount: 10,
        type: 'CREDIT_PACKAGE',
        referenceId: 'cmgnwm6rk002o10nv2qzieert',
        description: 'Pacote de Créditos - R$ 10.00',
        cardData: {
          paymentToken: paymentToken,
          customer: {
            name: data.cardName.trim().split(/\s+/).length >= 2 ? data.cardName : `${data.cardName} Silva`,
            email: 'user@example.com',
            cpf: data.cpf?.replace(/\D/g, '') || '',
            birth: '1990-01-01',
            phone_number: '11999999999'
          },
          billingAddress: {
            street: 'Rua Exemplo',
            number: '123',
            neighborhood: 'Centro',
            zipcode: '01234567',
            city: 'São Paulo',
            state: 'SP'
          }
        }
      });
      
      const response = await fetch(`${apiUrl}/card/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWducGdnbzUwMDA0MTBudnltb3NoaW54IiwiZW1haWwiOiJ0ZXN0ZUBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzYwMjkzMDE1LCJleHAiOjE3NjAzNzk0MTV9.pIkmkj4HWrzo1e4Sv8PzAqL16KW8aC_I9Hubt-6yU0A'
        },
        body: JSON.stringify({
          amount: 10,
          type: 'CREDIT_PACKAGE',
          referenceId: 'cmgnwm6rk002o10nv2qzieert',
          description: 'Pacote de Créditos - R$ 10.00',
          cardData: {
            paymentToken: paymentToken,
            customer: {
              name: data.cardName.trim().split(/\s+/).length >= 2 ? data.cardName : `${data.cardName} Silva`, // Garantir pelo menos 2 palavras
              email: 'user@example.com',
              cpf: data.cpf?.replace(/\D/g, '') || '',
              birth: '1990-01-01',
              phone_number: '11999999999'
            },
            billingAddress: {
              street: 'Rua Exemplo',
              number: '123',
              neighborhood: 'Centro',
              zipcode: '01234567',
              city: 'São Paulo',
              state: 'SP'
            }
          }
        })
      });

      console.log('🔍 Status da resposta:', response.status);
      console.log('🔍 Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        addTestResult('Backend Response', 'error', `Erro HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('🔍 Resultado da resposta:', result);

      if (result.success) {
        addTestResult('Payment', 'success', 'Pagamento realizado com sucesso!');
        toast.success('Pagamento realizado com sucesso!');
      } else {
        addTestResult('Payment', 'error', `Erro: ${result.error}`);
        toast.error(result.error || 'Erro ao processar pagamento');
      }
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      addTestResult('Payment', 'error', `Erro: ${error.message}`);
      toast.error(`Erro ao processar pagamento: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Teste de Pagamentos</h1>
        <p className="text-muted-foreground">
          Página dedicada para testar a integração de pagamentos com Efí
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Teste de Pagamento
            </CardTitle>
            <CardDescription>
              Teste o pagamento com cartão de crédito
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status da SDK */}
            <div className="mb-6 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {sdkReady ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : sdkError ? (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                )}
                <span className="font-medium">
                  {sdkReady ? (sdkError ? 'Modo Fallback' : 'SDK Pronta') : sdkError ? 'Erro na SDK' : 'Carregando SDK...'}
                </span>
              </div>
              {sdkError && (
                <p className="text-sm text-yellow-600">{sdkError}</p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Número do Cartão */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="pl-10"
                    {...register('cardNumber', {
                      onChange: (e) => {
                        e.target.value = formatCardNumber(e.target.value);
                      }
                    })}
                  />
                </div>
                {errors.cardNumber && (
                  <p className="text-sm text-red-500">{errors.cardNumber.message}</p>
                )}
              </div>

              {/* Nome no Cartão */}
              <div className="space-y-2">
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="Nome como está no cartão"
                  {...register('cardName')}
                />
                {errors.cardName && (
                  <p className="text-sm text-red-500">{errors.cardName.message}</p>
                )}
              </div>

              {/* Validade e CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Mês</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    maxLength={2}
                    {...register('expiryMonth')}
                  />
                  {errors.expiryMonth && (
                    <p className="text-sm text-red-500">{errors.expiryMonth.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Ano</Label>
                  <Input
                    id="expiryYear"
                    placeholder="AAAA"
                    maxLength={4}
                    {...register('expiryYear')}
                  />
                  {errors.expiryYear && (
                    <p className="text-sm text-red-500">{errors.expiryYear.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    {...register('cvv')}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-red-500">{errors.cvv.message}</p>
                  )}
                </div>
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  {...register('cpf', {
                    onChange: (e) => {
                      e.target.value = formatCPF(e.target.value);
                    }
                  })}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500">{errors.cpf.message}</p>
                )}
              </div>

              {/* Botão de Pagamento */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || processing}
              >
                {loading || processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {processing ? 'Processando...' : 'Tokenizando...'}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Testar Pagamento R$ 10,00
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Log de Testes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Log de Testes
            </CardTitle>
            <CardDescription>
              Resultados dos testes em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum teste executado ainda</p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : result.status === 'error' ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Loader2 className="w-4 h-4" />
                      )}
                      <span className="font-medium">{result.test}</span>
                      <span className="text-xs opacity-75">{result.timestamp}</span>
                    </div>
                    <p>{result.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
