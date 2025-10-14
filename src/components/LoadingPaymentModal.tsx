import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Lock, Shield, CreditCard } from 'lucide-react';

interface LoadingPaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: 'plan' | 'credits';
}

export default function LoadingPaymentModal({ open, onClose, type }: LoadingPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 text-center">
          {/* Ícone de cadeado animado */}
          <div className="relative mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Lock className="w-10 h-10 text-white" />
            </div>
            {/* Ícones secundários */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Texto principal */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Carregando ambiente seguro...
          </h3>
          
          <p className="text-gray-600 mb-4">
            {type === 'plan' 
              ? 'Preparando sua assinatura com segurança' 
              : 'Preparando compra de créditos com segurança'
            }
          </p>

          {/* Barra de progresso animada */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>

          {/* Indicadores de segurança */}
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>SSL</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <span>Encriptado</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
              <span>Seguro</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
