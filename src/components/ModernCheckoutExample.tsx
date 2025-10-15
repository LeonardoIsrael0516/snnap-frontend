import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Package, Sparkles } from 'lucide-react';
import ModernCheckout from './ModernCheckout';

export default function ModernCheckoutExample() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE';
    id: string;
    name: string;
    price: number;
    description: string;
  } | null>(null);

  const plans = [
    {
      id: 'plan-premium',
      name: 'Premium',
      price: 29.90,
      description: 'Plano premium com recursos avançados',
      features: ['Criação ilimitada', 'Templates premium', 'Suporte prioritário']
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      price: 49.90,
      description: 'Plano profissional para empresas',
      features: ['Tudo do Premium', 'API access', 'White-label']
    }
  ];

  const packages = [
    {
      id: 'credits-100',
      name: '100 Créditos',
      price: 19.90,
      description: 'Pacote básico de créditos',
      credits: 100
    },
    {
      id: 'credits-500',
      name: '500 Créditos',
      price: 79.90,
      description: 'Pacote popular de créditos',
      credits: 500
    },
    {
      id: 'credits-1000',
      name: '1000 Créditos',
      price: 149.90,
      description: 'Pacote premium de créditos',
      credits: 1000
    }
  ];

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedItem({
      type: 'PLAN_SUBSCRIPTION',
      id: plan.id,
      name: plan.name,
      price: plan.price,
      description: plan.description
    });
    setCheckoutOpen(true);
  };

  const handlePackageSelect = (pkg: typeof packages[0]) => {
    setSelectedItem({
      type: 'CREDIT_PACKAGE',
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description
    });
    setCheckoutOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Novo Checkout Moderno
        </h1>
        <p className="text-gray-600">
          Interface ultra moderna com botões separados para PIX e Cartão
        </p>
      </div>

      {/* Planos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          Planos de Assinatura
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                  <span className="text-sm font-normal text-gray-500">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pacotes de Créditos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-green-500" />
          Pacotes de Créditos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(pkg.price)}
                </div>
                <div className="text-sm text-gray-500">
                  {pkg.credits} créditos
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handlePackageSelect(pkg)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  Comprar {pkg.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal de Checkout */}
      {selectedItem && (
        <ModernCheckout
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          type={selectedItem.type}
          referenceId={selectedItem.id}
          amount={selectedItem.price}
          title={selectedItem.type === 'PLAN_SUBSCRIPTION' ? `Assinar ${selectedItem.name}` : `Comprar ${selectedItem.name}`}
          description={selectedItem.description}
        />
      )}
    </div>
  );
}


