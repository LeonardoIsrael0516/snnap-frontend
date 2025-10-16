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
import { toast } from "sonner";
import { 
  Crown, 
  Check,
  Star,
  Smartphone
} from "lucide-react";
import CaktoCheckoutModal from "./CaktoCheckoutModal";
import LoadingPaymentModal from "./LoadingPaymentModal";

interface PWAUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  features: string[];
  caktoCheckoutUrl?: string;
}

export default function PWAUpgradeModal({
  open,
  onOpenChange,
  onPlanSelected
}: PWAUpgradeModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Carregar planos que incluem PWA
  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      console.log('🔍 PWA Upgrade: Carregando planos...');
      const response = await fetch('http://localhost:3001/api/plans');
      console.log('🔍 PWA Upgrade: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 PWA Upgrade: Dados recebidos:', data);
        
        // Filtrar apenas planos que incluem PWA e excluir o plano Free
        const pwaPlans = (data.plans || data).filter((plan: Plan) => {
          const hasPWA = plan.pwaEnabled;
          const isNotFree = plan.name !== 'Free';
          const isActive = plan.isActive;
          console.log(`🔍 PWA Upgrade: Plano ${plan.name}: pwaEnabled=${hasPWA}, isNotFree=${isNotFree}, isActive=${isActive}`);
          return hasPWA && isNotFree && isActive;
        });
        console.log('🔍 PWA Upgrade: Planos com PWA:', pwaPlans);
        
        setPlans(pwaPlans);
      } else {
        console.error('❌ PWA Upgrade: Erro na resposta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ PWA Upgrade: Erro ao carregar planos:', error);
    }
  };

  const handlePlanSelect = async (plan: Plan) => {
    setSelectedPlan(plan);
    setLoadingOpen(true);
    
    // Simular carregamento por 2 segundos
    setTimeout(() => {
      setLoadingOpen(false);
      setCheckoutOpen(true);
    }, 2000);
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    setSelectedPlan(null);
    toast.success('Pagamento realizado com sucesso!');
    onOpenChange(false);
    // Recarregar dados se necessário
    if (open) {
      loadPlans();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Smartphone className="w-6 h-6 text-blue-600" />
            Upgrade de Plano para PWA
          </DialogTitle>
          <DialogDescription className="text-lg">
            Para transformar suas páginas em apps instaláveis, você precisa de um plano que inclua PWA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informação sobre PWA */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-500/30 rounded-xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Smartphone className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  O que é PWA?
                </h3>
                <p className="text-gray-200 mb-3">
                  PWA (Progressive Web App) transforma suas páginas em apps nativos instaláveis, 
                  com ícone personalizado, tela de carregamento e experiência offline.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 border-0 shadow-md">
                    📱 App instalável
                  </Badge>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 border-0 shadow-md">
                    🎨 Ícone personalizado
                  </Badge>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 border-0 shadow-md">
                    ⚡ Experiência nativa
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Planos disponíveis */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Planos que Incluem PWA
              </h3>
              <p className="text-muted-foreground">
                Escolha um plano para desbloquear o recurso PWA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhum plano com PWA disponível no momento.</p>
                </div>
              ) : (
                plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative cursor-pointer transition-all hover:shadow-lg ${
                      plan.isPopular ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan)}
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
                          <Smartphone className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            PWA habilitado
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            <strong>{plan.monthlyCredits}</strong> créditos mensais
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">
                            {plan.customDomainsLimit === -1 
                              ? 'Domínios ilimitados' 
                              : `${plan.customDomainsLimit} domínio(s) personalizado(s)`
                            }
                          </span>
                        </div>

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
                ))
              )}
            </div>
          </div>

          {/* Informação adicional */}
          <div className="bg-gray-50/10 dark:bg-gray-900/10 border border-gray-200/20 dark:border-gray-700/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100/20 dark:bg-gray-800/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Crown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Benefícios do PWA
                </h4>
                <ul className="text-sm text-gray-400 dark:text-gray-500 space-y-1">
                  <li>• <strong>Instalação:</strong> Usuários podem instalar seu app na tela inicial</li>
                  <li>• <strong>Performance:</strong> Carregamento mais rápido e experiência offline</li>
                  <li>• <strong>Personalização:</strong> Ícone, nome e tema personalizados</li>
                  <li>• <strong>Engajamento:</strong> Notificações push e experiência nativa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Checkout */}
      {selectedPlan && selectedPlan.caktoCheckoutUrl && (
        <CaktoCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          checkoutUrl={selectedPlan.caktoCheckoutUrl}
          onSuccess={() => {
            toast.success('Pagamento processado com sucesso!');
            setCheckoutOpen(false);
            onOpenChange(false);
            // Recarregar dados do usuário
            window.location.reload();
          }}
        />
      )}

      {/* Modal de carregamento */}
      <LoadingPaymentModal
        open={loadingOpen}
        onClose={() => setLoadingOpen(false)}
        type="plan"
      />
    </Dialog>
  );
}
