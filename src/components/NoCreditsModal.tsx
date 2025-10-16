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
  const [selectedCheckoutUrl, setSelectedCheckoutUrl] = useState<string>('');

  // Carregar pacotes de créditos
  useEffect(() => {
    if (open) {
      loadCreditPackages();
    }
  }, [open]);

  const loadCreditPackages = async () => {
    try {
      setLoading(true);
      console.log('🔍 NoCreditsModal: Carregando pacotes de créditos...');
      console.log('🔍 NoCreditsModal: VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      const url = `${import.meta.env.VITE_API_BASE_URL}/credit-packages`;
      console.log('🔍 NoCreditsModal: URL completa:', url);
      
      const response = await fetch(url);
      console.log('🔍 NoCreditsModal: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 NoCreditsModal: Dados recebidos:', data);
        
        // A API pode retornar { creditPackages: [...] } ou { packages: [...] } ou array direto
        const packagesData = data.creditPackages || data.packages || data;
        console.log('🔍 NoCreditsModal: Pacotes extraídos:', packagesData);
        
        const filteredPackages = packagesData.filter((pkg: CreditPackage) => pkg.isActive);
        console.log('🔍 NoCreditsModal: Pacotes filtrados:', filteredPackages);
        
        setCreditPackages(filteredPackages);
      } else {
        console.error('❌ NoCreditsModal: Erro na resposta:', response.status, response.statusText);
        toast.error('Erro ao carregar pacotes de créditos');
      }
    } catch (error) {
      console.error('❌ NoCreditsModal: Erro ao carregar pacotes de créditos:', error);
      toast.error('Erro ao carregar pacotes de créditos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsPurchase = (packageId: string) => {
    const pkg = creditPackages.find(p => p.id === packageId);
    if (pkg?.caktoCheckoutUrl) {
      setSelectedCheckoutUrl(pkg.caktoCheckoutUrl);
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
            {/* Explicação sobre créditos */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">
                    Como funcionam os créditos?
                  </h4>
                  <p className="text-sm text-gray-300">
                    Você já possui um plano ativo, mas seus créditos mensais foram consumidos. 
                    Compre pacotes de créditos adicionais para continuar criando e editando páginas.
                  </p>
                </div>
              </div>
            </div>

            {/* Pacotes de Créditos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Pacotes de Créditos Disponíveis
                </h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando pacotes...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creditPackages.map((pkg) => (
                    <Card 
                      key={pkg.id} 
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-gray-700 bg-gray-800 hover:border-purple-500"
                      onClick={() => handleCreditsPurchase(pkg.id)}
                    >
                      <CardHeader className="text-center pb-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Coins className="h-6 w-6 text-purple-500" />
                          <CardTitle className="text-lg text-white">
                            {pkg.name}
                          </CardTitle>
                        </div>
                        <div className="text-3xl font-bold text-purple-400">
                          {pkg.currency === 'BRL' ? 'R$' : '$'}{pkg.price}
                        </div>
                        <CardDescription className="text-sm text-gray-300">
                          {pkg.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <Coins className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-300">
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

                          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <CreditCard className="h-3 w-3" />
                            <span>Pagamento seguro</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreditsPurchase(pkg.id);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar
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
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Vantagens dos pacotes de créditos:
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
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
        checkoutUrl={selectedCheckoutUrl}
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
