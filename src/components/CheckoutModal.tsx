import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PixCheckout } from './PixCheckout';
import { CardCheckout } from './CardCheckout';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  type: 'plan' | 'package';
  referenceId: string;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

export function CheckoutModal({ 
  open, 
  onClose, 
  type, 
  referenceId, 
  amount, 
  description,
  onSuccess
}: CheckoutModalProps) {
  const [activeTab, setActiveTab] = useState('pix');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Finalizar Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-2xl font-bold mt-2">R$ {amount.toFixed(2)}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix">Pix</TabsTrigger>
              <TabsTrigger value="card">Cartão de Crédito</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pix">
              <PixCheckout 
                amount={amount}
                type={type === 'plan' ? 'PLAN_SUBSCRIPTION' : 'CREDIT_PACKAGE'}
                referenceId={referenceId}
                onSuccess={onSuccess || onClose}
              />
            </TabsContent>
            
            <TabsContent value="card">
              <CardCheckout 
                amount={amount}
                type={type === 'plan' ? 'PLAN_SUBSCRIPTION' : 'CREDIT_PACKAGE'}
                referenceId={referenceId}
                onSuccess={onSuccess || onClose}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
