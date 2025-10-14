import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Lock } from 'lucide-react';

interface LoadingPaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: 'plan' | 'credits';
}

export default function LoadingPaymentModal({ open, onClose, type }: LoadingPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-gray-900 border-gray-700">
        <div className="bg-gray-900 p-12 text-center">
          {/* Cadeado com animação de carregamento ao redor */}
          <div className="relative mb-8">
            {/* Anel de carregamento */}
            <div className="absolute inset-0 w-20 h-20 mx-auto">
              <div className="w-full h-full border-4 border-gray-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            
            {/* Cadeado central */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-300" />
            </div>
          </div>

          {/* Texto */}
          <p className="text-gray-300 text-lg font-medium">
            Carregando ambiente seguro...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
