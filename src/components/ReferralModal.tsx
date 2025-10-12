import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, Users, Gift, DollarSign, Check } from "lucide-react";
import { authenticatedFetch } from "@/lib/authService";
import { useToast } from "@/hooks/use-toast";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReferralStats {
  totalReferrals: number;
  totalCreditsEarned: number;
  pendingRewards: number;
  completedRewards: number;
  referrals: Array<{
    name: string;
    email: string;
    createdAt: string;
    isPaying: boolean;
  }>;
}

export function ReferralModal({ open, onOpenChange }: ReferralModalProps) {
  const [referralUrl, setReferralUrl] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadReferralData();
    }
  }, [open]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      
      const [codeRes, statsRes] = await Promise.all([
        authenticatedFetch(`${API_BASE_URL}/referrals/my-code`),
        authenticatedFetch(`${API_BASE_URL}/referrals/stats`)
      ]);

      const codeData = await codeRes.json();
      const statsData = await statsRes.json();

      setReferralUrl(codeData.referralUrl);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados de indicação:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "Compartilhe com seus amigos"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-instagram-text">
            Indique e Ganhe Créditos
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Link de Indicação */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Seu Link de Indicação</label>
              <div className="flex gap-2">
                <Input
                  value={referralUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopy} size="icon">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Como Funciona */}
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Como Funciona
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">+10</span>
                  <span>créditos quando seu indicado se cadastrar e usar pelo seu link</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">+100</span>
                  <span>créditos quando seu indicado assinar um plano pago</span>
                </div>
              </div>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold text-primary">{stats?.totalReferrals || 0}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Indicações
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-primary">{stats?.totalCreditsEarned || 0}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  Créditos Ganhos
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-yellow-500">{stats?.pendingRewards || 0}</div>
                <div className="text-sm text-muted-foreground">
                  Pendentes
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-500">
                  {stats?.referrals?.filter(r => r.isPaying).length || 0}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Pagantes
                </div>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
