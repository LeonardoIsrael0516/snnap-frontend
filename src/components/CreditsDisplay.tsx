import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap, Crown, Calendar, TrendingUp, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = 'http://localhost:3001/api';

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
  } | null;
  currentPeriodEnd: string;
}

export default function CreditsDisplay() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!permissions || !permissions.hasActivePlan) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Nenhum Plano Ativo
              </CardTitle>
              <CardDescription>
                Assine um plano para começar a criar páginas incríveis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="w-full gradient-instagram text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver Planos Disponíveis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const creditsPercentage = (permissions.credits.available / permissions.credits.total) * 100;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="w-5 h-5 text-primary" />
              Plano {permissions.plan?.name}
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
        {/* Credits */}
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
          <Progress value={creditsPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {permissions.credits.used} créditos usados neste período
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="flex items-start gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
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
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">PWA</p>
              <p className="text-xs text-muted-foreground">
                {permissions.pwaEnabled ? 'Habilitado' : 'Desabilitado'}
              </p>
            </div>
          </div>
        </div>

        {/* Low Credits Warning */}
        {permissions.credits.available < 5 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              ⚠️ Créditos baixos!
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
              Considere adquirir um pacote de créditos adicional
            </p>
            <Button variant="outline" size="sm" className="w-full mt-2 border-yellow-500/50 hover:bg-yellow-500/10">
              <ShoppingCart className="w-3 h-3 mr-2" />
              Comprar Créditos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}





