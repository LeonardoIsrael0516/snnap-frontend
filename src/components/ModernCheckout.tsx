import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  Lock, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PixModal from './PixModal';
import CardModal from './CardModal';

interface ModernCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  type: 'PLAN_SUBSCRIPTION' | 'CREDIT_PACKAGE';
  referenceId: string;
  description?: string;
}

export default function ModernCheckout({
  isOpen,
  onClose,
  title,
  amount,
  type,
  referenceId,
  description
}: ModernCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card' | null>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  const handlePixClick = () => {
    setSelectedMethod('pix');
    setPixModalOpen(true);
  };

  const handleCardClick = () => {
    setSelectedMethod('card');
    setCardModalOpen(true);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setPixModalOpen(false);
    setCardModalOpen(false);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="relative">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="text-3xl font-bold">{formatPrice(amount)}</div>
                {description && (
                  <div className="text-blue-100 text-sm mt-1">{description}</div>
                )}
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Escolha sua forma de pagamento
                </h3>
                <p className="text-sm text-gray-500">
                  Pagamento 100% seguro e criptografado
                </p>
              </div>

              {/* Botões de pagamento */}
              <div className="space-y-4">
                {/* PIX */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handlePixClick}
                    className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6" />
                        <div className="text-left">
                          <div className="font-semibold">PIX</div>
                          <div className="text-xs opacity-90">Aprovação instantânea</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          Rápido
                        </Badge>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Button>
                </motion.div>

                {/* Cartão */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleCardClick}
                    className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6" />
                        <div className="text-left">
                          <div className="font-semibold">Cartão de Crédito</div>
                          <div className="text-xs opacity-90">Visa, Mastercard, Elo</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          Seguro
                        </Badge>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </div>

              {/* Informações de segurança */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Pagamento 100% Seguro</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>SSL Criptografado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modais */}
      <PixModal
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
        onSuccess={handleClose}
        amount={amount}
        type={type}
        referenceId={referenceId}
        description={description}
      />

      <CardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        onSuccess={handleClose}
        amount={amount}
        type={type}
        referenceId={referenceId}
        description={description}
      />
    </>
  );
}

