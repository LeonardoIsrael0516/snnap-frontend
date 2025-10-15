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

interface InsufficientCreditsModalProps {
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

export default function InsufficientCreditsModal({
  open,
  onOpenChange,
  requiredCredits,
  action,
  onPlanSelected,
  onCreditsPurchased
}: InsufficientCreditsModalProps) {
  const [userPlan, setUserPlan] = useState<{ name: string; isFree: boolean } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados do usuário e planos
  useEffect(() => {
    if (open) {
      loadUserData();
      loadPlans();
      loadCreditPackages();
    }
  }, [open]);

  const loadUserData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setUserPlan({
          name: data.plan?.name || 'Free',
          isFree: data.plan?.name === 'Free' || !data.plan
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

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

  const handlePlanSelect = async (planId: string) => {
    setLoading(true);
    try {
      // Aqui você implementaria a lógica de seleção de plano
      // Por enquanto, apenas chama o callback
      onPlanSelected?.(planId);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsPurchase = async (packageId: string) => {
    setLoading(true);
    try {
      // Aqui você implementaria a lógica de compra de créditos
      // Por enquanto, apenas chama o callback
      onCreditsPurchased?.(packageId);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao comprar créditos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionText = () => {
    switch (action) {
      case 'criação':
        return 'criar uma nova página';
      case 'edição':
        return 'editar esta página';
      case 'importação':
        return 'importar este template';
      default:
        return 'realizar esta ação';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Créditos Insuficientes
          </DialogTitle>
          <DialogDescription>
            Você não possui créditos suficientes para {getActionText()}. Considere adquirir um plano ou pacote de créditos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informação sobre a ação */}
          <div className="bg-gray-50/10 dark:bg-gray-900/10 border border-gray-200/20 dark:border-gray-700/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100/20 dark:bg-gray-800/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">
                  Ação: {action.charAt(0).toUpperCase() + action.slice(1)} de Página
                </h4>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Disponível após obter créditos
                </p>
              </div>
            </div>
          </div>

          {/* Tabs baseadas no plano do usuário */}
          <Tabs defaultValue={userPlan?.isFree ? "plans" : "credits"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Planos
              </TabsTrigger>
              <TabsTrigger 
                value="credits" 
                className="flex items-center gap-2"
                disabled={userPlan?.isFree}
              >
                <Zap className="w-4 h-4" />
                Créditos
              </TabsTrigger>
            </TabsList>

            {/* Tab de Planos */}
            <TabsContent value="plans" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  {userPlan?.isFree ? 'Escolha um Plano' : 'Atualize seu Plano'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userPlan?.isFree 
                    ? 'Planos pagos oferecem mais créditos e recursos'
                    : 'Atualize para um plano com mais créditos mensais'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative cursor-pointer transition-all hover:shadow-lg ${
                      plan.isPopular ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.isPopular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            R$ {plan.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">/mês</div>
                        </div>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            <strong>{plan.monthlyCredits}</strong> créditos mensais
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            {plan.customDomainsLimit === -1 
                              ? 'Domínios ilimitados' 
                              : `${plan.customDomainsLimit} domínio(s) personalizado(s)`
                            }
                          </span>
                        </div>
                        
                        {plan.pwaEnabled && (
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-purple-600" />
                            <span className="text-sm">PWA habilitado</span>
                          </div>
                        )}

                        {/* Exibir features adicionais do plano */}
                        {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                          <div className="space-y-2">
                            {plan.features.map((feature: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        variant={plan.isPopular ? "default" : "outline"}
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : 'Escolher Plano'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab de Créditos (apenas para planos pagos) */}
            <TabsContent value="credits" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Comprar Créditos Adicionais</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione créditos extras ao seu plano atual
                </p>
              </div>

              <div className="grid gap-4">
                {creditPackages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => handleCreditsPurchase(pkg.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            R$ {pkg.price.toFixed(2)}
                          </div>
                          {pkg.discount && (
                            <div className="text-sm text-green-600 font-medium">
                              {pkg.discount}% de desconto
                            </div>
                          )}
                        </div>
                      </div>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 mb-4">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">
                          <strong>{pkg.credits}</strong> créditos adicionais
                        </span>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : 'Comprar Créditos'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Informação adicional */}
          <div className="bg-gray-50/10 dark:bg-gray-900/10 border border-gray-200/20 dark:border-gray-700/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100/20 dark:bg-gray-800/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Como funcionam os créditos?
                </h4>
                <ul className="text-sm text-gray-400 dark:text-gray-500 space-y-1">
                  <li>• <strong>Criação de página:</strong> 1-2 créditos</li>
                  <li>• <strong>Edição de página:</strong> 1 - 1.5 créditos</li>
                  <li>• <strong>Importação de template:</strong> 1 crédito</li>
                  <li>• <strong>Créditos mensais:</strong> Renovam automaticamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
