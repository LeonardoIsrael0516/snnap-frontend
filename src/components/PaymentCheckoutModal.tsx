import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, ArrowLeft, Check } from 'lucide-react';
import { PixCheckout } from './PixCheckout';
import { CardCheckout } from './CardCheckout';

interface PaymentCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  type: 'plan' | 'package';
  referenceId: string;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

type PaymentStep = 'method' | 'pix' | 'card';

export function PaymentCheckoutModal({ 
  open, 
  onClose, 
  type, 
  referenceId, 
  amount, 
  description,
  onSuccess
}: PaymentCheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card' | null>(null);

  const handleMethodSelect = (method: 'pix' | 'card') => {
    setSelectedMethod(method);
    setCurrentStep(method);
  };

  const handleBack = () => {
    if (currentStep === 'pix' || currentStep === 'card') {
      setCurrentStep('method');
      setSelectedMethod(null);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method':
        return 'Escolha a forma de pagamento';
      case 'pix':
        return 'Pagamento via Pix';
      case 'card':
        return 'Pagamento via Cartão';
      default:
        return 'Finalizar Pagamento';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'method':
        return 'Selecione como deseja pagar';
      case 'pix':
        return 'Escaneie o QR Code ou copie o código Pix';
      case 'card':
        return 'Preencha os dados do seu cartão';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {currentStep !== 'method' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="text-xl">{getStepTitle()}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getStepDescription()}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Resumo do Pedido */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{description}</p>
                <p className="text-sm text-muted-foreground">
                  {type === 'plan' ? 'Assinatura mensal' : 'Pacote de créditos'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  R$ {amount.toFixed(2)}
                </p>
                {type === 'plan' && (
                  <Badge variant="secondary" className="text-xs">
                    Renovação automática
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo das Etapas */}
        {currentStep === 'method' && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {/* Opção Pix */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleMethodSelect('pix')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Pix</h3>
                      <p className="text-sm text-muted-foreground">
                        Pagamento instantâneo e seguro
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        Instantâneo
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opção Cartão */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleMethodSelect('card')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Cartão de Crédito</h3>
                      <p className="text-sm text-muted-foreground">
                        Parcelamento em até 12x sem juros
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        Até 12x
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informações de Segurança */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Pagamento 100% Seguro
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Seus dados são protegidos com criptografia SSL e processados pela Efí (Gerencianet)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'pix' && (
          <PixCheckout 
            amount={amount}
            type={type === 'plan' ? 'PLAN_SUBSCRIPTION' : 'CREDIT_PACKAGE'}
            referenceId={referenceId}
            onSuccess={handleSuccess}
          />
        )}

        {currentStep === 'card' && (
          <CardCheckout 
            amount={amount}
            type={type === 'plan' ? 'PLAN_SUBSCRIPTION' : 'CREDIT_PACKAGE'}
            referenceId={referenceId}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
