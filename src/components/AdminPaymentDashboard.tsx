import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  DollarSign, 
  Users, 
  CreditCard, 
  Smartphone, 
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentStats {
  total: number;
  active: number;
  cancelled: number;
  paused: number;
  expiringSoon: number;
}

interface ExpiringSubscription {
  id: string;
  userId: string;
  planId: string;
  currentPeriodEnd: string;
  status: string;
}

interface AdminPaymentDashboardProps {
  isAdmin: boolean;
}

export function AdminPaymentDashboard({ isAdmin }: AdminPaymentDashboardProps) {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<ExpiringSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_PAYMENTS_API_URL}/admin/renewal/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      toast.error(error.message || 'Erro ao carregar estatísticas');
    }
  };

  const fetchExpiringSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_PAYMENTS_API_URL}/admin/renewal/expiring?days=7`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar assinaturas');
      }

      const result = await response.json();
      if (result.success) {
        setExpiringSubscriptions(result.data.subscriptions);
      }
    } catch (error: any) {
      console.error('Erro ao buscar assinaturas:', error);
      toast.error(error.message || 'Erro ao carregar assinaturas');
    }
  };

  const runManualCheck = async () => {
    setActionLoading('check');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_PAYMENTS_API_URL}/admin/renewal/check`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao executar verificação');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Verificação executada com sucesso');
        fetchStats();
        fetchExpiringSubscriptions();
      }
    } catch (error: any) {
      console.error('Erro na verificação:', error);
      toast.error(error.message || 'Erro ao executar verificação');
    } finally {
      setActionLoading(null);
    }
  };

  const renewSubscription = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_PAYMENTS_API_URL}/admin/renewal/renew/${subscriptionId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao renovar assinatura');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Assinatura renovada com sucesso');
        fetchExpiringSubscriptions();
      }
    } catch (error: any) {
      console.error('Erro ao renovar assinatura:', error);
      toast.error(error.message || 'Erro ao renovar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchExpiringSubscriptions();
      setLoading(false);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mr-2" />
          <span>Acesso negado. Apenas administradores podem acessar este painel.</span>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando painel administrativo...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Painel de Pagamentos</h2>
        <Button 
          onClick={runManualCheck}
          disabled={actionLoading === 'check'}
          variant="outline"
        >
          {actionLoading === 'check' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Renovações
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Assinaturas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ativas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                  <CreditCard className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expirando em 7 dias</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas Próximas do Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              {expiringSubscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma assinatura expirando em 7 dias</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expiringSubscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Usuário: {subscription.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          Plano: {subscription.planId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expira em: {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {subscription.status}
                        </Badge>
                        
                        <Button
                          size="sm"
                          onClick={() => renewSubscription(subscription.id)}
                          disabled={actionLoading === subscription.id}
                        >
                          {actionLoading === subscription.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Renovar'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
