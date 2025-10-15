import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from './CheckoutModal';
import { toast } from '@/hooks/use-toast';

export function CheckoutExample() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE'>('CREDIT_PACKAGE');
  const [checkoutData, setCheckoutData] = useState({
    referenceId: '',
    amount: 0,
    title: '',
    description: ''
  });

  const handleOpenCheckout = (type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE') => {
    setCheckoutType(type);
    
    if (type === 'CREDIT_PACKAGE') {
      setCheckoutData({
        referenceId: 'credits_100',
        amount: 10.00,
        title: 'Pacote de 100 Créditos',
        description: 'Adicione 100 créditos à sua conta para criar mais páginas'
      });
    } else {
      setCheckoutData({
        referenceId: 'plan_premium',
        amount: 29.90,
        title: 'Plano Premium',
        description: 'Acesso completo a todos os recursos por 1 mês'
      });
    }
    
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    toast({
      title: "Pagamento realizado com sucesso!",
      description: `ID do pagamento: ${paymentId}`,
    });
    
    // Aqui você pode redirecionar o usuário ou atualizar a interface
    console.log('Pagamento realizado:', paymentId);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Exemplo de Checkout</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Pacote de Créditos</h3>
          <p className="text-muted-foreground mb-4">
            100 créditos por R$ 10,00
          </p>
          <Button 
            onClick={() => handleOpenCheckout('CREDIT_PACKAGE')}
            className="w-full"
          >
            Comprar Créditos
          </Button>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Plano Premium</h3>
          <p className="text-muted-foreground mb-4">
            Acesso completo por R$ 29,90/mês
          </p>
          <Button 
            onClick={() => handleOpenCheckout('PLAN_SUBSCRIPTION')}
            className="w-full"
          >
            Assinar Plano
          </Button>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        type={checkoutType}
        referenceId={checkoutData.referenceId}
        amount={checkoutData.amount}
        title={checkoutData.title}
        description={checkoutData.description}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}


