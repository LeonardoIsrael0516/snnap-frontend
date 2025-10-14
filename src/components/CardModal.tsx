import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  ArrowLeft, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generatePaymentToken } from '@/lib/efi-sdk';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE';
  referenceId: string;
  description?: string;
}

interface CardData {
  number: string;
  name: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cpf: string;
  phone: string;
}

export default function CardModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  type,
  referenceId,
  description
}: CardModalProps) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cpf: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<CardData>>({});
  const [cardBrand, setCardBrand] = useState<string>('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Detectar bandeira do cartão
  const detectCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';
    if (/^3[0689]/.test(cleanNumber)) return 'diners';
    if (/^35/.test(cleanNumber)) return 'jcb';
    if (/^636/.test(cleanNumber)) return 'elo';
    
    return 'unknown';
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // Limitar a 16 dígitos + 3 espaços
  };

  // Formatar CPF
  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Formatar Telefone
  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };


  // Validar CPF
  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };


  // Atualizar dados do cartão
  const updateCardData = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    switch (field) {
      case 'number':
        formattedValue = formatCardNumber(value);
        const brand = detectCardBrand(value);
        setCardBrand(brand);
        break;
      case 'cpf':
        formattedValue = formatCPF(value);
        break;
      case 'expiryMonth':
        if (value.length === 2 && parseInt(value) > 12) {
          formattedValue = '12';
        }
        break;
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: Partial<CardData> = {};
    
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
      newErrors.number = 'Número do cartão inválido';
    }
    
    if (!cardData.name || cardData.name.trim().length < 2) {
      newErrors.name = 'Nome completo é obrigatório';
    }
    
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      newErrors.expiryMonth = 'Data de validade é obrigatória';
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV é obrigatório';
    }
    
    if (!cardData.cpf || !validateCPF(cardData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!cardData.phone || cardData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Processar pagamento
  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setProcessing(true);
    
    try {
      // Converter ano de 2 dígitos para 4 dígitos
      const fullYear = cardData.expiryYear.length === 2 
        ? `20${cardData.expiryYear}` 
        : cardData.expiryYear;

      // Em produção, enviar dados do cartão para o backend gerar o token
      // Em sandbox, gerar token localmente
      const isProduction = import.meta.env.VITE_EFI_SANDBOX === 'false';
      
      let paymentToken;
      
      if (isProduction) {
        console.log('🔍 [FRONTEND] Modo produção - enviando dados para backend gerar token');
        // Enviar dados do cartão para o backend gerar o token
        const tokenResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/payments/generate-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              cardData: {
                brand: cardBrand,
                number: cardData.number.replace(/\s/g, ''),
                cvv: cardData.cvv,
                expirationMonth: cardData.expiryMonth,
                expirationYear: fullYear,
                name: cardData.name,
                cpf: cardData.cpf.replace(/\D/g, '')
              }
            })
          }
        );
        
        if (!tokenResponse.ok) {
          throw new Error('Erro ao gerar token de pagamento');
        }
        
        const tokenData = await tokenResponse.json();
        paymentToken = tokenData.paymentToken;
        console.log('✅ [FRONTEND] Token gerado pelo backend:', paymentToken);
      } else {
        console.log('🔍 [FRONTEND] Modo sandbox - gerando token localmente');
        // Gerar token localmente em sandbox
        paymentToken = await generatePaymentToken({
          brand: cardBrand,
          number: cardData.number.replace(/\s/g, ''),
          cvv: cardData.cvv,
          expirationMonth: cardData.expiryMonth,
          expirationYear: fullYear,
          name: cardData.name,
          cpf: cardData.cpf.replace(/\D/g, '')
        });
      }

      // Obter email do usuário do localStorage
      const userData = localStorage.getItem('user');
      const userEmail = userData ? JSON.parse(userData).email : 'user@example.com';

      // Criar pagamento
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/payments/create-card`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type,
            referenceId,
            amount,
            cardData: {
              paymentToken,
              customer: {
                name: cardData.name,
                cpf: cardData.cpf.replace(/\D/g, ''),
                phone_number: cardData.phone.replace(/\D/g, ''),
                email: userEmail
              },
              billingAddress: {
                street: 'Rua Exemplo',
                number: '123',
                neighborhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '01234567'
              }
            },
            description
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      const data = await response.json();
      
      if (data.status === 'PAID') {
        toast.success('Pagamento aprovado com sucesso!');
        onSuccess();
      } else {
        toast.error('Pagamento não foi aprovado');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  // Focar no próximo campo quando mês for preenchido
  useEffect(() => {
    if (cardData.expiryMonth.length === 2) {
      const yearInput = document.getElementById('expiryYear') as HTMLInputElement;
      if (yearInput) {
        yearInput.focus();
      }
    }
  }, [cardData.expiryMonth]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        aria-describedby="card-payment-description"
      >
        <div className="relative">
          {/* Hidden description for accessibility */}
          <div id="card-payment-description" className="sr-only">
            Modal para pagamento com cartão de crédito. Preencha os dados do cartão e confirme o pagamento.
          </div>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
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
                  <CreditCard className="w-5 h-5" />
                  Pagamento com Cartão
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="mt-4">
              <div className="text-3xl font-bold">{formatPrice(amount)}</div>
              <div className="text-blue-100 text-sm mt-1">Pagamento seguro</div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            {/* Dados do Cartão */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados do Cartão</h3>
              
              {/* Número do Cartão */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => updateCardData('number', e.target.value)}
                    className={`pr-12 ${errors.number ? 'border-red-500' : ''}`}
                    maxLength={19}
                  />
                  {cardBrand && cardBrand !== 'unknown' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-4 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          {cardBrand.toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.number && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.number}
                  </p>
                )}
              </div>

              {/* Nome do Portador */}
              <div className="space-y-2">
                <Label htmlFor="cardName">Nome do Portador</Label>
                <Input
                  id="cardName"
                  type="text"
                  placeholder="Nome como está no cartão"
                  value={cardData.name}
                  onChange={(e) => updateCardData('name', e.target.value.toUpperCase())}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Validade e CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Validade</Label>
                  <div className="flex gap-2">
                    <Input
                      id="expiryMonth"
                      type="text"
                      placeholder="MM"
                      value={cardData.expiryMonth}
                      onChange={(e) => updateCardData('expiryMonth', e.target.value.replace(/\D/g, '').slice(0, 2))}
                      className={`text-center ${errors.expiryMonth ? 'border-red-500' : ''}`}
                      maxLength={2}
                    />
                    <Input
                      id="expiryYear"
                      type="text"
                      placeholder="AA"
                      value={cardData.expiryYear}
                      onChange={(e) => updateCardData('expiryYear', e.target.value.replace(/\D/g, '').slice(0, 2))}
                      className={`text-center ${errors.expiryMonth ? 'border-red-500' : ''}`}
                      maxLength={2}
                    />
                  </div>
                  {errors.expiryMonth && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.expiryMonth}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      type={showCvv ? 'text' : 'password'}
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => updateCardData('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={`pr-10 ${errors.cvv ? 'border-red-500' : ''}`}
                      maxLength={4}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCvv(!showCvv)}
                    >
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.cvv && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cvv}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
              
              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cardData.cpf}
                  onChange={(e) => updateCardData('cpf', e.target.value)}
                  className={errors.cpf ? 'border-red-500' : ''}
                  maxLength={14}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.cpf}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={cardData.phone}
                  onChange={(e) => updateCardData('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                  maxLength={15}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Botão de Pagamento */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {processing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      <span>Processando...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Pagar {formatPrice(amount)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Informações de segurança */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">Pagamento 100% Seguro</span>
              </div>
              <p className="text-xs text-gray-500">
                Seus dados são criptografados e protegidos com tecnologia SSL
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
