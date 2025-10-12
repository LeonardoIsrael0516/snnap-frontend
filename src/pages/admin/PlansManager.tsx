import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Crown, DollarSign, Zap, Globe, Smartphone, Package, TrendingUp, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  monthlyCredits: number;
  customDomainsLimit: number;
  pwaEnabled: boolean;
  isActive: boolean;
  stripePriceId: string | null;
  features: string[];
  displayOrder: number;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    userPlans: number;
  };
}

interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price: number;
  currency: string;
  discount: number | null;
  stripePriceId: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
  };
}

export default function PlansManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);

  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'BRL',
    monthlyCredits: '',
    customDomainsLimit: '0',
    pwaEnabled: false,
    isActive: true,
    stripePriceId: '',
    features: '',
    displayOrder: '0',
    isPopular: false
  });

  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    credits: '',
    price: '',
    currency: 'BRL',
    discount: '',
    stripePriceId: '',
    isActive: true,
    displayOrder: '0'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPlans(), loadCreditPackages()]);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/plans`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  const loadCreditPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/credit-packages`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCreditPackages(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      toast.error('Erro ao carregar pacotes de créditos');
    }
  };

  const handleCreatePlan = async () => {
    try {
      const features = planForm.features.split(',').map(f => f.trim()).filter(f => f);
      
      const response = await fetch(`${API_BASE_URL}/admin/plans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...planForm,
          features
        })
      });

      if (response.ok) {
        toast.success('Plano criado com sucesso!');
        setPlanModalOpen(false);
        resetPlanForm();
        loadPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar plano');
      }
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast.error('Erro ao criar plano');
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const features = planForm.features.split(',').map(f => f.trim()).filter(f => f);
      
      const response = await fetch(`${API_BASE_URL}/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...planForm,
          features
        })
      });

      if (response.ok) {
        toast.success('Plano atualizado com sucesso!');
        setPlanModalOpen(false);
        setEditingPlan(null);
        resetPlanForm();
        loadPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao atualizar plano');
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/plans/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success('Plano deletado com sucesso!');
        loadPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao deletar plano');
      }
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      toast.error('Erro ao deletar plano');
    }
  };

  const handleCreatePackage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/credit-packages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(packageForm)
      });

      if (response.ok) {
        toast.success('Pacote criado com sucesso!');
        setPackageModalOpen(false);
        resetPackageForm();
        loadCreditPackages();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar pacote');
      }
    } catch (error) {
      console.error('Erro ao criar pacote:', error);
      toast.error('Erro ao criar pacote');
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/credit-packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(packageForm)
      });

      if (response.ok) {
        toast.success('Pacote atualizado com sucesso!');
        setPackageModalOpen(false);
        setEditingPackage(null);
        resetPackageForm();
        loadCreditPackages();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao atualizar pacote');
      }
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      toast.error('Erro ao atualizar pacote');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este pacote?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/credit-packages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success('Pacote deletado com sucesso!');
        loadCreditPackages();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao deletar pacote');
      }
    } catch (error) {
      console.error('Erro ao deletar pacote:', error);
      toast.error('Erro ao deletar pacote');
    }
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      currency: plan.currency,
      monthlyCredits: plan.monthlyCredits.toString(),
      customDomainsLimit: plan.customDomainsLimit.toString(),
      pwaEnabled: plan.pwaEnabled,
      isActive: plan.isActive,
      stripePriceId: plan.stripePriceId || '',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      displayOrder: plan.displayOrder.toString(),
      isPopular: plan.isPopular
    });
    setPlanModalOpen(true);
  };

  const openEditPackage = (pkg: CreditPackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description || '',
      credits: pkg.credits.toString(),
      price: pkg.price.toString(),
      currency: pkg.currency,
      discount: pkg.discount ? pkg.discount.toString() : '',
      stripePriceId: pkg.stripePriceId || '',
      isActive: pkg.isActive,
      displayOrder: pkg.displayOrder.toString()
    });
    setPackageModalOpen(true);
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      description: '',
      price: '',
      currency: 'BRL',
      monthlyCredits: '',
      customDomainsLimit: '0',
      pwaEnabled: false,
      isActive: true,
      stripePriceId: '',
      features: '',
      displayOrder: '0',
      isPopular: false
    });
    setEditingPlan(null);
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: '',
      description: '',
      credits: '',
      price: '',
      currency: 'BRL',
      discount: '',
      stripePriceId: '',
      isActive: true,
      displayOrder: '0'
    });
    setEditingPackage(null);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Planos</h1>
          <p className="text-muted-foreground mt-1">
            Configure planos de assinatura e pacotes de créditos
          </p>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Pacotes de Créditos
          </TabsTrigger>
        </TabsList>

        {/* Planos Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {
              resetPlanForm();
              setPlanModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
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
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {plan.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditPlan(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      {formatPrice(plan.price, plan.currency)}
                    </div>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        <strong>{plan.monthlyCredits}</strong> créditos mensais
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {plan.customDomainsLimit === -1
                          ? 'Domínios ilimitados'
                          : plan.customDomainsLimit === 0
                          ? 'Sem domínios personalizados'
                          : `${plan.customDomainsLimit} domínio(s) personalizado(s)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        PWA: {plan.pwaEnabled ? 'Habilitado' : 'Desabilitado'}
                      </span>
                    </div>
                    {Array.isArray(plan.features) && plan.features.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-semibold mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {plan._count?.userPlans || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {plans.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Crown className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum plano criado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie seu primeiro plano de assinatura
                </p>
                <Button onClick={() => {
                  resetPlanForm();
                  setPlanModalOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Plano
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Credit Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {
              resetPackageForm();
              setPackageModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Pacote
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditPackage(pkg)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {pkg.description && (
                    <CardDescription className="text-xs">
                      {pkg.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-3xl font-bold">
                        {pkg.credits}
                      </div>
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
                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <Badge variant={pkg.isActive ? "default" : "secondary"}>
                      {pkg.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {pkg._count?.transactions || 0} vendas
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {creditPackages.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum pacote criado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie seu primeiro pacote de créditos
                </p>
                <Button onClick={() => {
                  resetPackageForm();
                  setPackageModalOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Pacote
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Plan Modal */}
      <Dialog open={planModalOpen} onOpenChange={(open) => {
        setPlanModalOpen(open);
        if (!open) resetPlanForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do plano de assinatura
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="Ex: Plano Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (mensal) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                placeholder="Descrição do plano..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyCredits">Créditos Mensais *</Label>
                <Input
                  id="monthlyCredits"
                  type="number"
                  value={planForm.monthlyCredits}
                  onChange={(e) => setPlanForm({ ...planForm, monthlyCredits: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomainsLimit">Limite de Domínios</Label>
                <Select
                  value={planForm.customDomainsLimit}
                  onValueChange={(value) => setPlanForm({ ...planForm, customDomainsLimit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhum</SelectItem>
                    <SelectItem value="1">1 domínio</SelectItem>
                    <SelectItem value="3">3 domínios</SelectItem>
                    <SelectItem value="5">5 domínios</SelectItem>
                    <SelectItem value="10">10 domínios</SelectItem>
                    <SelectItem value="-1">Ilimitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Ordem de Exibição</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={planForm.displayOrder}
                  onChange={(e) => setPlanForm({ ...planForm, displayOrder: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                <Input
                  id="stripePriceId"
                  value={planForm.stripePriceId}
                  onChange={(e) => setPlanForm({ ...planForm, stripePriceId: e.target.value })}
                  placeholder="price_xxxxx (opcional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (separadas por vírgula)</Label>
              <Textarea
                id="features"
                value={planForm.features}
                onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                placeholder="Analytics avançado, Suporte prioritário, ..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pwaEnabled"
                  checked={planForm.pwaEnabled}
                  onCheckedChange={(checked) => setPlanForm({ ...planForm, pwaEnabled: checked })}
                />
                <Label htmlFor="pwaEnabled" className="cursor-pointer">
                  PWA Habilitado
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={planForm.isPopular}
                  onCheckedChange={(checked) => setPlanForm({ ...planForm, isPopular: checked })}
                />
                <Label htmlFor="isPopular" className="cursor-pointer">
                  Marcar como Popular
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={planForm.isActive}
                onCheckedChange={(checked) => setPlanForm({ ...planForm, isActive: checked })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Plano Ativo
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setPlanModalOpen(false);
              resetPlanForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}>
              {editingPlan ? 'Atualizar' : 'Criar'} Plano
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package Modal */}
      <Dialog open={packageModalOpen} onOpenChange={(open) => {
        setPackageModalOpen(open);
        if (!open) resetPackageForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Editar Pacote' : 'Novo Pacote de Créditos'}
            </DialogTitle>
            <DialogDescription>
              Configure o pacote de créditos avulso
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pkg-name">Nome do Pacote *</Label>
              <Input
                id="pkg-name"
                value={packageForm.name}
                onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                placeholder="Ex: Pacote 100 Créditos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pkg-description">Descrição</Label>
              <Textarea
                id="pkg-description"
                value={packageForm.description}
                onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                placeholder="Descrição do pacote..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Quantidade de Créditos *</Label>
                <Input
                  id="credits"
                  type="number"
                  value={packageForm.credits}
                  onChange={(e) => setPackageForm({ ...packageForm, credits: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-price">Preço *</Label>
                <Input
                  id="pkg-price"
                  type="number"
                  step="0.01"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={packageForm.discount}
                  onChange={(e) => setPackageForm({ ...packageForm, discount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-displayOrder">Ordem</Label>
                <Input
                  id="pkg-displayOrder"
                  type="number"
                  value={packageForm.displayOrder}
                  onChange={(e) => setPackageForm({ ...packageForm, displayOrder: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pkg-stripePriceId">Stripe Price ID</Label>
              <Input
                id="pkg-stripePriceId"
                value={packageForm.stripePriceId}
                onChange={(e) => setPackageForm({ ...packageForm, stripePriceId: e.target.value })}
                placeholder="price_xxxxx (opcional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pkg-isActive"
                checked={packageForm.isActive}
                onCheckedChange={(checked) => setPackageForm({ ...packageForm, isActive: checked })}
              />
              <Label htmlFor="pkg-isActive" className="cursor-pointer">
                Pacote Ativo
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setPackageModalOpen(false);
              resetPackageForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={editingPackage ? handleUpdatePackage : handleCreatePackage}>
              {editingPackage ? 'Atualizar' : 'Criar'} Pacote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}





