import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  CreditCard, 
  Crown, 
  Zap, 
  Check,
  AlertTriangle,
  Star
} from "lucide-react";

interface InsufficientCreditsModalPaidProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  action: 'criação' | 'edição' | 'importação';
  onPlanSelected?: (planId: string) => void;
  onCreditsPurchased?: (packageId: string) => void;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  monthlyCredits: number;
  customDomainsLimit: number;
  pwaEnabled: boolean;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
}

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  discount?: number;
  isActive: boolean;
}

export default function InsufficientCreditsModalPaid({
  open,
  onOpenChange,
  requiredCredits,
  action,
  onPlanSelected,
  onCreditsPurchased
}: InsufficientCreditsModalPaidProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados
  useEffect(() => {
    if (open) {
      loadPlans();
      loadCreditPackages();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/plans`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas planos ativos e excluir o plano Free
        setPlans(data.filter((plan: Plan) => plan.isActive && plan.name !== 'Free'));
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const loadCreditPackages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/credit-packages`);
      if (response.ok) {
        const data = await response.json();
        setCreditPackages(data.filter((pkg: CreditPackage) => pkg.isActive));
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes de créditos:', error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    if (onPlanSelected) {
      onPlanSelected(planId);
    }
    onOpenChange(false);
  };

  const handleCreditsPurchase = (packageId: string) => {
    if (onCreditsPurchased) {
      onCreditsPurchased(packageId);
    }
    onOpenChange(false);
  };

  const getActionText = () => {
    switch (action) {
      case 'criação':
        return 'criar uma nova página';
      case 'edição':
        return 'editar sua página';
      case 'importação':
        return 'importar um template';
      default:
        return 'realizar esta ação';
    }
  };

  const getCreditRange = () => {
    switch (action) {
      case 'criação':
        return '1-2 créditos';
      case 'edição':
        return '1-2 créditos';
      case 'importação':
        return '1 crédito';
      default:
        return '1-2 créditos';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Créditos Insuficientes
          </DialogTitle>
          <DialogDescription>
            Você precisa de mais créditos para {getActionText()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações sobre a ação */}
          <div className="bg-slate-900/10 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-slate-700">Ação: {action === 'criação' ? 'Criação de Página' : action === 'edição' ? 'Edição de Página' : 'Importação de Template'}</span>
            </div>
            <p className="text-sm text-slate-600">
              Esta ação requer {getCreditRange()} e você não possui créditos suficientes.
            </p>
          </div>

          {/* Como funcionam os créditos */}
          <div className="bg-slate-900/10 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-slate-700">Como funcionam os créditos?</span>
            </div>
            <p className="text-sm text-slate-600">
              Os créditos são consumidos a cada ação que você realiza. Com um plano pago, você recebe créditos mensais que se renovam automaticamente.
            </p>
          </div>

          {/* Tabs para Planos e Créditos */}
          <Tabs defaultValue="credits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credits" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Comprar Créditos
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Planos
              </TabsTrigger>
            </TabsList>

            {/* Aba de Créditos */}
            <TabsContent value="credits" className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Pacotes de Créditos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => handleCreditsPurchase(pkg.id)}
                  >
                    <CardHeader className="text-center pb-2">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Coins className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        {pkg.currency === 'BRL' ? 'R$' : '$'}{pkg.price}
                      </div>
                      <CardDescription className="text-sm">
                        {pkg.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{pkg.credits} créditos</span>
                        </div>
                        
                        {pkg.discount && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-500 text-white">
                              {pkg.discount}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreditsPurchase(pkg.id);
                        }}
                      >
                        Comprar {pkg.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Aba de Planos */}
            <TabsContent value="plans" className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Planos Disponíveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative cursor-pointer transition-all hover:shadow-lg ${
                      plan.isPopular ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        {plan.currency === 'BRL' ? 'R$' : '$'}{plan.price}
                        <span className="text-sm font-normal text-slate-500">/mês</span>
                      </div>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{plan.monthlyCredits} créditos/mês</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            {plan.customDomainsLimit === 0 ? 'Sem domínios' : 
                             plan.customDomainsLimit === -1 ? 'Domínios ilimitados' : 
                             `${plan.customDomainsLimit} domínio(s)`}
                          </span>
                        </div>
                        
                        {plan.pwaEnabled && (
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">PWA habilitado</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanSelect(plan.id);
                        }}
                      >
                        Escolher {plan.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}




