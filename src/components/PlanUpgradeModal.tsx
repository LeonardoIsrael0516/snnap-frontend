import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Star, Zap } from 'lucide-react';
import { authenticatedFetch } from '@/lib/authService';
import { toast } from 'sonner';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  monthlyCredits: number;
  customDomainsLimit: number;
  pwaEnabled: boolean;
  features: string[];
  isPopular: boolean;
}

interface UserPlan {
  plan: {
    name: string;
    description: string;
  };
  creditsAvailable: number;
  creditsTotal: number;
  currentPeriodEnd: string;
}

interface PlanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string; // Feature que requer upgrade (ex: "PWA")
}

export function PlanUpgradeModal({ open, onOpenChange, feature }: PlanUpgradeModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [plansRes, userPlanRes] = await Promise.all([
        authenticatedFetch('/api/plans'),
        authenticatedFetch('/api/user/plan')
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans || []);
      }

      if (userPlanRes.ok) {
        const userPlanData = await userPlanRes.json();
        setUserPlan(userPlanData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: Plan) => {
    try {
      setSelectedPlan(plan);
      setCheckoutOpen(true);
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      toast.error('Erro ao fazer upgrade do plano');
    }
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    onOpenChange(false);
    toast.success('Pagamento realizado com sucesso! Seu plano foi ativado.');
    // Recarregar dados do usuário
    loadData();
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case 'PWA':
        return 'Para transformar suas páginas em apps instaláveis';
      default:
        return 'Para acessar recursos premium';
    }
  };

  const getFeatureIcon = () => {
    switch (feature) {
      case 'PWA':
        return <Crown className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {getFeatureIcon()}
            Upgrade de Plano
          </DialogTitle>
          <DialogDescription>
            {getFeatureDescription()}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Planos Disponíveis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Escolha seu novo plano</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans
                  .filter(plan => plan.name !== 'Free' && plan.isActive)
                  .map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`relative transition-all duration-200 hover:shadow-lg ${
                        plan.isPopular ? 'border-2 border-primary shadow-md' : 'border'
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground px-3 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            Mais Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {plan.description}
                        </CardDescription>
                        <div className="mt-4">
                          <div className="text-3xl font-bold text-primary">
                            R$ {plan.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">por mês</div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>{plan.monthlyCredits} créditos mensais</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>
                              {plan.customDomainsLimit === -1 
                                ? 'Domínios ilimitados' 
                                : `${plan.customDomainsLimit} domínios personalizados`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {plan.pwaEnabled ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span>PWA habilitado</span>
                              </>
                            ) : (
                              <>
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                <span className="text-muted-foreground">PWA não disponível</span>
                              </>
                            )}
                          </div>
                        </div>

                        {plan.features && plan.features.length > 0 && (
                          <div className="space-y-1">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Check className="w-3 h-3 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleUpgrade(plan)}
                          disabled={plan.name === userPlan?.plan.name}
                        >
                          {plan.name === userPlan?.plan.name ? 'Plano Atual' : 'Fazer Upgrade'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Informações Adicionais */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground text-center">
                  <p>💡 <strong>Dica:</strong> Você pode fazer upgrade a qualquer momento e os créditos serão adicionados imediatamente à sua conta.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
      
      {/* Modal de Checkout */}
      {selectedPlan && (
        <PaymentCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          type="plan"
          referenceId={selectedPlan.id}
          amount={selectedPlan.price}
          description={`Assinatura ${selectedPlan.name} - ${selectedPlan.description}`}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </Dialog>
  );
}
