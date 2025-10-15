import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Crown, Zap, Globe, Smartphone, Calendar, ShoppingCart, TrendingUp, Package, CreditCard } from "lucide-react";
import CaktoCheckoutModal from "./CaktoCheckoutModal";
import LoadingPaymentModal from "./LoadingPaymentModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

interface UserPermissions {
  hasActivePlan: boolean;
  canCreatePages: boolean;
  customDomainsLimit: number;
  customDomainsUsed: number;
  canCreateMoreDomains: boolean;
  pwaEnabled: boolean;
  creditsAvailable: number;
  credits: {
    available: number;
    used: number;
    total: number;
  };
  plan: {
    id: string;
    name: string;
    monthlyCredits: number;
    price: number;
    currency: string;
  } | null;
  currentPeriodEnd: string;
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  monthlyCredits: number;
  customDomainsLimit: number;
  pwaEnabled: boolean;
  isPopular: boolean;
  features: string[];
}

interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price: number;
  currency: string;
  discount: number | null;
}

interface UserPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserPlanModal({ open, onOpenChange }: UserPlanModalProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPermissions(),
        loadPlans(),
        loadCreditPackages()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/permissions`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/plans`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const loadCreditPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/credit-packages`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCreditPackages(data.creditPackages || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleUpgradePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setLoadingOpen(true);
    
    // Simular carregamento por 2 segundos
    setTimeout(() => {
      setLoadingOpen(false);
      setCheckoutOpen(true);
    }, 2000);
  };

  const handleBuyCredits = (package_: CreditPackage) => {
    setSelectedPackage(package_);
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
    setSelectedPackage(null);
    toast.success('Pagamento realizado com sucesso!');
    // Recarregar dados
    loadData();
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Meu Plano e Créditos
          </DialogTitle>
          <DialogDescription>
            Gerencie seu plano de assinatura e créditos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`grid w-full ${permissions?.plan?.name === 'Free' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="current" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Plano Atual
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Planos
            </TabsTrigger>
            {permissions?.plan?.name !== 'Free' && (
              <TabsTrigger value="credits" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Créditos
              </TabsTrigger>
            )}
          </TabsList>

          {/* Plano Atual */}
          <TabsContent value="current" className="space-y-4">
            {!permissions || !permissions.hasActivePlan ? (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Nenhum Plano Ativo
                  </CardTitle>
                  <CardDescription>
                    Assine um plano para começar a criar páginas incríveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTab("plans")}
                    className="w-full gradient-instagram text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ver Planos Disponíveis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Plano Atual */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-primary" />
                          {permissions.plan?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          Renova em {formatDate(permissions.currentPeriodEnd)}
                        </CardDescription>
                      </div>
                      <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white">
                        Ativo
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Créditos */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-semibold">Créditos</span>
                        </div>
                        <span className="text-2xl font-bold">
                          {permissions.credits.available}
                          <span className="text-sm text-muted-foreground font-normal">
                            /{permissions.credits.total}
                          </span>
                        </span>
                      </div>
                      <Progress 
                        value={(permissions.credits.available / permissions.credits.total) * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {permissions.credits.used} créditos usados neste período
                      </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className="flex items-start gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Domínios</p>
                          <p className="text-xs text-muted-foreground">
                            {permissions.customDomainsLimit === -1
                              ? 'Ilimitados'
                              : `${permissions.customDomainsUsed}/${permissions.customDomainsLimit}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Smartphone className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">PWA</p>
                          <p className="text-xs text-muted-foreground">
                            {permissions.pwaEnabled ? 'Habilitado' : 'Desabilitado'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Low Credits Warning - apenas para planos pagos */}
                    {(() => {
                      console.log('🔍 Debug Credits Warning (Modal):', {
                        creditsTotal: permissions.credits.total,
                        creditsAvailable: permissions.credits.available,
                        planName: permissions.plan?.name,
                        isFree: permissions.plan?.name === 'Free',
                        shouldShow: permissions.credits.total < 5 && permissions.plan?.name !== 'Free'
                      });
                      return permissions.credits.total < 5 && permissions.plan?.name !== 'Free';
                    })() && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                          ⚠️ Créditos baixos!
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                          Considere adquirir um pacote de créditos adicional
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2 border-yellow-500/50 hover:bg-yellow-500/10"
                          onClick={() => setActiveTab("credits")}
                        >
                          <ShoppingCart className="w-3 h-3 mr-2" />
                          Comprar Créditos
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Planos Disponíveis */}
          <TabsContent value="plans" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.filter(plan => plan.name !== 'Free').map((plan) => (
                <Card key={plan.id} className={`relative ${plan.isPopular ? 'border-primary border-2' : ''}`}>
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description || 'Sem descrição'}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {formatPrice(plan.price, plan.currency)}
                      </div>
                      <p className="text-sm text-muted-foreground">/mês</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm">{plan.monthlyCredits} créditos mensais</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {plan.customDomainsLimit === -1
                            ? 'Domínios ilimitados'
                            : plan.customDomainsLimit === 0
                            ? 'Sem domínios personalizados'
                            : `${plan.customDomainsLimit} Domínios personalizados`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          PWA: {plan.pwaEnabled ? 'Habilitado' : 'Desabilitado'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleUpgradePlan(plan)}
                      disabled={permissions?.plan?.id === plan.id}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {permissions?.plan?.id === plan.id ? 'Plano Atual' : 'Assinar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pacotes de Créditos - apenas para planos pagos */}
          {permissions?.plan?.name !== 'Free' && (
            <TabsContent value="credits" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditPackages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.description && (
                        <CardDescription className="text-xs">
                          {pkg.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-3xl font-bold">{pkg.credits}</div>
                          <p className="text-xs text-muted-foreground">créditos</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(pkg.price, pkg.currency)}
                          </div>
                          {pkg.discount && (
                            <Badge variant="secondary" className="text-xs">
                              -{pkg.discount}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleBuyCredits(pkg)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
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
            // Recarregar dados do usuário
            window.location.reload();
          }}
        />
      )}

      {selectedPackage && selectedPackage.caktoCheckoutUrl && (
        <CaktoCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          checkoutUrl={selectedPackage.caktoCheckoutUrl}
          onSuccess={() => {
            toast.success('Pagamento processado com sucesso!');
            setCheckoutOpen(false);
            // Recarregar dados do usuário
            window.location.reload();
          }}
        />
      )}

      {/* Modal de carregamento */}
      <LoadingPaymentModal
        open={loadingOpen}
        onClose={() => setLoadingOpen(false)}
        type={selectedPlan ? 'plan' : 'credits'}
      />
    </Dialog>
  );
}
