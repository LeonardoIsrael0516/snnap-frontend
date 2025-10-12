import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Smartphone, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE';
  method: 'PIX' | 'CREDIT_CARD';
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
  amount: number;
  createdAt: string;
  updatedAt: string;
  planId?: string;
  packageId?: string;
}

interface PaymentHistoryProps {
  userId: string;
}

export function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchPayments = async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_PAYMENTS_API_URL}/payments?limit=10&offset=${currentOffset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar pagamentos');
      }

      const result = await response.json();
      if (result.success) {
        if (reset) {
          setPayments(result.data.payments);
        } else {
          setPayments(prev => [...prev, ...result.data.payments]);
        }
        setHasMore(result.data.hasMore);
        setOffset(currentOffset + 10);
      }
    } catch (error: any) {
      console.error('Erro ao buscar pagamentos:', error);
      toast.error(error.message || 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(true);
  }, [userId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'PAID': 'default',
      'PENDING': 'secondary',
      'CANCELLED': 'destructive',
      'REFUNDED': 'outline',
      'EXPIRED': 'destructive'
    };

    const labels: Record<string, string> = {
      'PAID': 'Pago',
      'PENDING': 'Pendente',
      'CANCELLED': 'Cancelado',
      'REFUNDED': 'Reembolsado',
      'EXPIRED': 'Expirado'
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    return method === 'PIX' ? <Smartphone className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    return type === 'PLAN_SUBSCRIPTION' ? 'Assinatura' : 'Pacote de Créditos';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadMore = () => {
    fetchPayments(false);
  };

  if (loading && payments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando histórico de pagamentos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pagamento encontrado</p>
              <p className="text-sm">Seus pagamentos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.method)}
                      <span className="font-medium">
                        {payment.method}
                      </span>
                    </div>
                    
                    <div>
                      <p className="font-medium">
                        {getTypeLabel(payment.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        R$ {payment.amount.toFixed(2)}
                      </p>
                    </div>
                    
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button 
                    onClick={loadMore} 
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Carregando...
                      </>
                    ) : (
                      'Carregar Mais'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
