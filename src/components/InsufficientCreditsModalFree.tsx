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
import CaktoCheckoutModal from "./CaktoCheckoutModal";
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

interface InsufficientCreditsModalFreeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  action: 'criação' | 'edição' | 'importação';
  onPlanSelected?: (planId: string) => void;
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
  caktoProductId: string | null;
  caktoCheckoutUrl: string | null;
  features: string[];
}

export default function InsufficientCreditsModalFree({
  open,
  onOpenChange,
  requiredCredits,
  action,
  onPlanSelected
}: InsufficientCreditsModalFreeProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [caktoModalOpen, setCaktoModalOpen] = useState(false);
  const [selectedCheckoutUrl, setSelectedCheckoutUrl] = useState<string>('');

  // Carregar planos
  useEffect(() => {
    if (open) {
      loadPlans();
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

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan?.caktoCheckoutUrl) {
      setSelectedCheckoutUrl(plan.caktoCheckoutUrl);
      setCaktoModalOpen(true);
    } else {
      // Fallback para o método antigo se não tiver URL da Cakto
      if (onPlanSelected) {
        onPlanSelected(planId);
      }
      onOpenChange(false);
    }
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
          {/* Tabs - apenas Planos */}
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Planos
              </TabsTrigger>
            </TabsList>

            {/* Aba de Planos */}
            <TabsContent value="plans" className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Planos Disponíveis</h3>
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
                      <div className="text-2xl font-bold text-white">
                        {plan.currency === 'BRL' ? 'R$' : '$'}{plan.price}
                        <span className="text-sm font-normal text-white">/mês</span>
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

          {/* Como funcionam os créditos */}
          <div className="bg-slate-900/10 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-white">Como funcionam os créditos?</span>
            </div>
            <p className="text-sm text-white">
              Os créditos são consumidos a cada ação que você realiza. Com um plano pago, você recebe créditos mensais que se renovam automaticamente.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Modal Cakto Checkout */}
    <CaktoCheckoutModal
      open={caktoModalOpen}
      onClose={() => setCaktoModalOpen(false)}
      checkoutUrl={selectedCheckoutUrl}
      onSuccess={() => {
        setCaktoModalOpen(false);
        onOpenChange(false);
        // Recarregar página para atualizar créditos/plano
        window.location.reload();
      }}
    />
  );
}
