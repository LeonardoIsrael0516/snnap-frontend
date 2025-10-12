import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export function PaymentExample() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'plan' | 'package'>('package');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Exemplo de planos
  const plans = [
    {
      id: 'plan_basic',
      name: 'Plano Básico',
      price: 29.90,
      description: 'Até 10 páginas por mês',
      features: ['10 páginas IA', 'Suporte por email', 'Analytics básico']
    },
    {
      id: 'plan_pro',
      name: 'Plano Pro',
      price: 59.90,
      description: 'Até 50 páginas por mês',
      features: ['50 páginas IA', 'Suporte prioritário', 'Analytics avançado', 'Domínio personalizado']
    },
    {
      id: 'plan_enterprise',
      name: 'Plano Enterprise',
      price: 99.90,
      description: 'Páginas ilimitadas',
      features: ['Páginas ilimitadas', 'Suporte 24/7', 'Analytics completo', 'API access', 'White label']
    }
  ];

  // Exemplo de pacotes de créditos
  const creditPackages = [
    {
      id: 'credits_100',
      name: '100 Créditos',
      price: 19.90,
      description: 'Para testar a plataforma',
      credits: 100
    },
    {
      id: 'credits_500',
      name: '500 Créditos',
      price: 79.90,
      description: 'Pacote popular',
      credits: 500
    },
    {
      id: 'credits_1000',
      name: '1000 Créditos',
      price: 149.90,
      description: 'Melhor custo-benefício',
      credits: 1000
    }
  ];

  const handlePayment = (type: 'plan' | 'package', item: any) => {
    setPaymentType(type);
    setSelectedItem(item);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    setCheckoutOpen(false);
    // Aqui você pode adicionar lógica para atualizar o estado do usuário
    // Por exemplo, recarregar dados do usuário, mostrar mensagem de sucesso, etc.
    console.log('Pagamento realizado com sucesso!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Escolha seu Plano</h1>
        <p className="text-muted-foreground">
          Selecione o plano que melhor atende às suas necessidades
        </p>
      </div>

      {/* Planos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Planos Mensais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <div className="text-3xl font-bold">
                R$ {plan.price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handlePayment('plan', plan)}
                className="w-full"
              >
                Assinar Plano
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Pacotes de Créditos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Pacotes de Créditos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((package_) => (
            <div key={package_.id} className="border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{package_.name}</h3>
                <p className="text-muted-foreground">{package_.description}</p>
              </div>
              
              <div className="text-3xl font-bold">
                R$ {package_.price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  ({package_.credits} créditos)
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                R$ {(package_.price / package_.credits).toFixed(2)} por crédito
              </div>

              <Button 
                onClick={() => handlePayment('package', package_)}
                className="w-full"
                variant="outline"
              >
                Comprar Créditos
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Checkout */}
      {selectedItem && (
        <PaymentCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          type={paymentType}
          referenceId={selectedItem.id}
          amount={selectedItem.price}
          description={
            paymentType === 'plan' 
              ? `${selectedItem.name} - ${selectedItem.description}`
              : `${selectedItem.name} - ${selectedItem.description}`
          }
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
