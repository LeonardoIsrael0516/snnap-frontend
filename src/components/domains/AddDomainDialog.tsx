import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addCustomDomain } from "@/lib/customDomains";

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (domainInfo?: any) => void;
}

export function AddDomainDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddDomainDialogProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [type, setType] = useState<"LINK_AI" | "BIOLINK">("LINK_AI");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!domain.trim()) {
      toast({
        title: "Domínio obrigatório",
        description: "Por favor, insira um domínio válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await addCustomDomain(domain.trim(), type);

      toast({
        title: "Domínio adicionado!",
        description: `Configure o registro TXT no seu DNS para ativar o domínio.`,
      });

      setDomain("");
      setType("LINK_AI");
      onOpenChange(false);
      onSuccess(result);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar domínio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Domínio Personalizado</DialogTitle>
          <DialogDescription>
            Adicione um domínio personalizado para suas páginas. Você precisará
            configurar o DNS após adicionar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                placeholder="exemplo.com ou sub.exemplo.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Não inclua "http://" ou "https://"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Serviço</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as "LINK_AI" | "BIOLINK")}
                disabled={loading}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LINK_AI">
                    Snapylink (Páginas com IA)
                  </SelectItem>
                  <SelectItem value="BIOLINK">
                    Biolinks (Links na Bio)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Você receberá instruções TXT para configurar no DNS
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Adicionando...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
