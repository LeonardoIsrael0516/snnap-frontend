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
  Coins, 
  AlertTriangle,
  Zap,
  Check,
  CreditCard,
  ShoppingCart
} from "lucide-react";
import CaktoCheckoutModal from "./CaktoCheckoutModal";
import LoadingPaymentModal from "./LoadingPaymentModal";

interface NoCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  action: 'criação' | 'edição' | 'importação';
  onCreditsPurchased?: (packageId: string) => void;
}

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  discount?: number;
  caktoProductId: string | null;
  caktoCheckoutUrl: string | null;
  isActive: boolean;
}

export default function NoCreditsModal({
  open,
  onOpenChange,
  requiredCredits,
  action,
  onCreditsPurchased
}: NoCreditsModalProps) {
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  // Carregar pacotes de créditos
  useEffect(() => {
    if (open) {
      loadCreditPackages();
    }
  }, [open]);

  const loadCreditPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/credit-packages`);
      if (response.ok) {
        const data = await response.json();
        // A API pode retornar { packages: [...] } ou array direto
        const packagesData = data.packages || data;
        setCreditPackages(packagesData.filter((pkg: CreditPackage) => pkg.isActive));
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes de créditos:', error);
      toast.error('Erro ao carregar pacotes de créditos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsPurchase = (packageId: string) => {
    const pkg = creditPackages.find(p => p.id === packageId);
    if (pkg?.caktoCheckoutUrl) {
      setSelectedPackage(pkg);
      setLoadingOpen(true);
      
      // Simular carregamento por 2 segundos
      setTimeout(() => {
        setLoadingOpen(false);
        setCheckoutOpen(true);
      }, 2000);
    } else {
      // Fallback para o método antigo se não tiver URL da Cakto
      if (onCreditsPurchased) {
        onCreditsPurchased(packageId);
      }
      onOpenChange(false);
    }
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    onOpenChange(false);
    toast.success('Créditos adquiridos com sucesso!');
    // Recarregar página para atualizar créditos
    window.location.reload();
  };

  const getActionText = () => {
    switch (action) {
      case 'criação':
        return 'criar uma nova página';
      case 'edição':
        return 'editar sua página';
      case 'importação':
        return 'importar um template';
      default:
        return 'realizar esta ação';
    }
  };

  const getCreditRange = () => {
    switch (action) {
      case 'criação':
        return '2 créditos';
      case 'edição':
        return '1.4 créditos';
      case 'importação':
        return '1 crédito';
      default:
        return '1-2 créditos';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Sem Créditos Disponíveis
            </DialogTitle>
            <DialogDescription>
              Você não possui créditos suficientes para {getActionText()}. Compre um pacote de créditos para continuar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informação sobre a ação */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-orange-800 dark:text-orange-200">
                    Ação: {action.charAt(0).toUpperCase() + action.slice(1)} de Página
                  </h4>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    Necessário: {getCreditRange()} | Disponível: 0 créditos
                  </p>
                </div>
              </div>
            </div>

            {/* Explicação sobre créditos */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Como funcionam os créditos?
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Você já possui um plano ativo, mas seus créditos mensais foram consumidos. 
                    Compre pacotes de créditos adicionais para continuar criando e editando páginas.
                  </p>
                </div>
              </div>
            </div>

            {/* Pacotes de Créditos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Pacotes de Créditos Disponíveis
                </h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando pacotes...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creditPackages.map((pkg) => (
                    <Card 
                      key={pkg.id} 
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-green-300 dark:hover:border-green-700"
                      onClick={() => handleCreditsPurchase(pkg.id)}
                    >
                      <CardHeader className="text-center pb-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Coins className="h-6 w-6 text-green-500" />
                          <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
                            {pkg.name}
                          </CardTitle>
                        </div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {pkg.currency === 'BRL' ? 'R$' : '$'}{pkg.price}
                        </div>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          {pkg.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <Coins className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {pkg.credits} créditos
                            </span>
                          </div>
                          
                          {pkg.discount && (
                            <div className="flex justify-center">
                              <Badge className="bg-red-500 text-white">
                                {pkg.discount}% OFF
                              </Badge>
                            </div>
                          )}

                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <CreditCard className="h-3 w-3" />
                            <span>Pagamento seguro</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreditsPurchase(pkg.id);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar {pkg.name}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && creditPackages.length === 0 && (
                <div className="text-center py-8">
                  <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhum pacote de créditos disponível no momento.
                  </p>
                </div>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Vantagens dos pacotes de créditos:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Créditos são adicionados instantaneamente à sua conta</li>
                    <li>• Não expiram e podem ser usados a qualquer momento</li>
                    <li>• Ideal para usuários que precisam de créditos extras</li>
                    <li>• Pagamento único, sem renovação automática</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Cakto Checkout */}
      <CaktoCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        checkoutUrl={selectedPackage?.caktoCheckoutUrl || ''}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Modal de carregamento */}
      <LoadingPaymentModal
        open={loadingOpen}
        onClose={() => setLoadingOpen(false)}
        type="credits"
      />
    </>
  );
}
