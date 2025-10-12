import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Search, Edit, Plus, Minus, Crown, Calendar, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
  monthlyCredits: number;
}

interface UserPlan {
  id: string;
  userId: string;
  planId: string;
  status: string;
  creditsAvailable: number;
  creditsUsed: number;
  creditsTotal: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  plan: Plan;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export default function UserPlansManager() {
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [adjustCreditsModalOpen, setAdjustCreditsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPlan | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<{ userPlan: UserPlan, transactions: Transaction[] } | null>(null);

  const [assignForm, setAssignForm] = useState({
    userId: '',
    email: '',
    planId: ''
  });

  const [adjustForm, setAdjustForm] = useState({
    creditsAdjustment: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUserPlans(), loadPlans()]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/user-plans`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUserPlans(data);
      }
    } catch (error) {
      console.error('Erro ao carregar planos de usuários:', error);
      toast.error('Erro ao carregar planos de usuários');
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
    }
  };

  const handleAssignPlan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/user-plans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: assignForm.userId,
          planId: assignForm.planId
        })
      });

      if (response.ok) {
        toast.success('Plano atribuído com sucesso!');
        setAssignModalOpen(false);
        setAssignForm({ userId: '', email: '', planId: '' });
        loadUserPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao atribuir plano');
      }
    } catch (error) {
      console.error('Erro ao atribuir plano:', error);
      toast.error('Erro ao atribuir plano');
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/user-plans/${selectedUser.userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(adjustForm)
      });

      if (response.ok) {
        toast.success('Créditos ajustados com sucesso!');
        setAdjustCreditsModalOpen(false);
        setSelectedUser(null);
        setAdjustForm({ creditsAdjustment: '', description: '' });
        loadUserPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao ajustar créditos');
      }
    } catch (error) {
      console.error('Erro ao ajustar créditos:', error);
      toast.error('Erro ao ajustar créditos');
    }
  };

  const viewUserDetails = async (userPlan: UserPlan) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/user-plans/${userPlan.userId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails({
          userPlan: data,
          transactions: data.recentTransactions || []
        });
        setDetailsModalOpen(true);
      } else {
        toast.error('Erro ao carregar detalhes');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      toast.error('Erro ao carregar detalhes');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      ACTIVE: { variant: "default", label: "Ativo" },
      CANCELLED: { variant: "destructive", label: "Cancelado" },
      EXPIRED: { variant: "secondary", label: "Expirado" },
      PAUSED: { variant: "outline", label: "Pausado" }
    };
    const config = variants[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      MONTHLY_RESET: 'Reset Mensal',
      PACKAGE_PURCHASE: 'Compra de Pacote',
      PAGE_CREATION: 'Criação de Página',
      PAGE_EDIT: 'Edição de Página',
      TEMPLATE_IMPORT: 'Importação de Template',
      ADMIN_ADJUSTMENT: 'Ajuste Admin',
      REFUND: 'Reembolso'
    };
    return types[type] || type;
  };

  const filteredUserPlans = userPlans.filter(up =>
    up.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (up.user.name && up.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    up.plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Gerenciamento de Planos de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Atribua planos e gerencie créditos dos usuários
          </p>
        </div>
        <Button onClick={() => setAssignModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Atribuir Plano
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por email, nome ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="whitespace-nowrap">
              {filteredUserPlans.length} usuário(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUserPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário com plano encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUserPlans.map((userPlan) => (
                <TableRow key={userPlan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{userPlan.user.name || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">{userPlan.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-primary" />
                      <span className="font-medium">{userPlan.plan.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {userPlan.creditsAvailable} / {userPlan.creditsTotal}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {userPlan.creditsUsed} usados
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(userPlan.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(userPlan.currentPeriodStart)}</div>
                      <div className="text-muted-foreground">
                        até {formatDate(userPlan.currentPeriodEnd)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewUserDetails(userPlan)}
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(userPlan);
                          setAdjustCreditsModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Assign Plan Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Plano a Usuário</DialogTitle>
            <DialogDescription>
              Selecione um plano para atribuir ao usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID do Usuário *</Label>
              <Input
                id="userId"
                value={assignForm.userId}
                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                placeholder="clxxxxxx"
              />
              <p className="text-xs text-muted-foreground">
                Copie o ID do usuário da lista de usuários
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (referência)</Label>
              <Input
                id="email"
                value={assignForm.email}
                onChange={(e) => setAssignForm({ ...assignForm, email: e.target.value })}
                placeholder="usuario@example.com"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planId">Plano *</Label>
              <Select
                value={assignForm.planId}
                onValueChange={(value) => setAssignForm({ ...assignForm, planId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.monthlyCredits} créditos/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignPlan}>
              Atribuir Plano
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjust Credits Modal */}
      <Dialog open={adjustCreditsModalOpen} onOpenChange={setAdjustCreditsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Créditos</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>Ajustar créditos de {selectedUser.user.name || selectedUser.user.email}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Créditos Disponíveis:</span>
                  <span className="font-bold">{selectedUser.creditsAvailable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Créditos Totais:</span>
                  <span>{selectedUser.creditsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Créditos Usados:</span>
                  <span>{selectedUser.creditsUsed}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditsAdjustment">Ajuste de Créditos *</Label>
                <Input
                  id="creditsAdjustment"
                  type="number"
                  value={adjustForm.creditsAdjustment}
                  onChange={(e) => setAdjustForm({ ...adjustForm, creditsAdjustment: e.target.value })}
                  placeholder="Ex: 50 (positivo) ou -20 (negativo)"
                />
                <p className="text-xs text-muted-foreground">
                  Use valores positivos para adicionar ou negativos para remover créditos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição/Motivo *</Label>
                <Textarea
                  id="description"
                  value={adjustForm.description}
                  onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
                  placeholder="Motivo do ajuste..."
                  rows={3}
                />
              </div>

              {adjustForm.creditsAdjustment && (
                <div className="p-3 bg-primary/10 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <strong>Novo saldo:</strong>{' '}
                    {selectedUser.creditsAvailable + parseInt(adjustForm.creditsAdjustment || '0')} créditos
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setAdjustCreditsModalOpen(false);
              setAdjustForm({ creditsAdjustment: '', description: '' });
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAdjustCredits}>
              Ajustar Créditos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Plano do Usuário</DialogTitle>
            <DialogDescription>
              {userDetails && (
                <>Histórico e informações de {userDetails.userPlan.user.name || userDetails.userPlan.user.email}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {userDetails && (
            <div className="space-y-4 py-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Créditos Disponíveis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userDetails.userPlan.creditsAvailable}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Créditos Usados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userDetails.userPlan.creditsUsed}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Total no Período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userDetails.userPlan.creditsTotal}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="font-semibold mb-3">Transações Recentes</h3>
                <div className="space-y-2">
                  {userDetails.transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma transação registrada
                    </p>
                  ) : (
                    userDetails.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{getTransactionTypeLabel(transaction.type)}</div>
                          <div className="text-xs text-muted-foreground">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Saldo: {transaction.balance}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}





