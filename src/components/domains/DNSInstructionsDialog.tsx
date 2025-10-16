import { Copy, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { type CustomDomain } from "@/lib/customDomains";

interface DNSInstructionsDialogProps {
  domain: CustomDomain;
  domainInfo?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => void;
}

export function DNSInstructionsDialog({
  domain,
  domainInfo,
  open,
  onOpenChange,
  onVerify,
}: DNSInstructionsDialogProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração DNS</DialogTitle>
          <DialogDescription>
            Siga as instruções abaixo para configurar o DNS do seu domínio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Atual */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Status Atual</h4>
                <p className="text-sm text-muted-foreground">
                  {domain.status === "ACTIVE"
                    ? "✅ Domínio configurado e ativo"
                    : domain.status === "PENDING"
                    ? "⏳ Aguardando configuração DNS"
                    : "❌ Configuração DNS incorreta"}
                </p>
              </div>
              {domain.status === "ACTIVE" && (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
            </div>
          </Card>

          {/* Instruções */}
          <div className="space-y-3">
            <h4 className="font-semibold">Instruções:</h4>
            
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">1.</span>
                <span>
                  Acesse o painel de controle do seu provedor de domínio (ex: Registro.br,
                  GoDaddy, Hostinger, etc.)
                </span>
              </p>
              
              <p className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">2.</span>
                <span>Localize a seção de gerenciamento DNS ou Zone Editor</span>
              </p>
              
              <p className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">3.</span>
                <span>
                  Adicione um novo registro <strong>TXT</strong> com as seguintes configurações:
                </span>
              </p>
            </div>

            {/* Configurações DNS - TXT */}
            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                Configuração TXT (Cloudflare for SaaS)
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome/Host</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      {domain.txtRecordName || `_cf-custom-hostname.${domain.domain}`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          domain.txtRecordName || `_cf-custom-hostname.${domain.domain}`,
                          "Nome/Host"
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nome do registro TXT fornecido pelo Cloudflare
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      TXT
                    </code>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Valor
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono break-all">
                      {domain.txtRecordValue || "Aguardando geração..."}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(domain.txtRecordValue || "", "Valor TXT")
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor único para validação de propriedade do domínio
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">TTL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      3600 (ou Automático)
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tempo em segundos para cache do DNS
                  </p>
                </div>
              </div>
            </Card>

            {/* Configuração CNAME */}
            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Configuração CNAME (Obrigatória)
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome/Host</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      {domain.domain}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(domain.domain, "Nome do domínio")
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seu domínio personalizado
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      CNAME
                    </code>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Valor/Destino
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      {domainInfo?.cname?.target || "d05a2h02r6.snnap.link"}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(domainInfo?.cname?.target || "d05a2h02r6.snnap.link", "Destino CNAME")
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aponta para o servidor da Snnap
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">4.</span>
                <span>Salve as configurações no painel do seu provedor</span>
              </p>
              
              <p className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">5.</span>
                <span>
                  Aguarde a propagação do DNS (pode levar de alguns minutos até 48 horas)
                </span>
              </p>
              
              <p className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">6.</span>
                <span>
                  Clique em "Verificar DNS" abaixo para confirmar a configuração
                </span>
              </p>
            </div>
          </div>

          {/* Observações */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
              📌 Observações Importantes
            </h4>
            <ul className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
              <li>• <strong>Validação TXT:</strong> O Cloudflare for SaaS usa registro TXT para validar propriedade do domínio</li>
              <li>• <strong>CNAME Obrigatório:</strong> Configure o CNAME apontando para d05a2h02r6.snnap.link</li>
              <li>• <strong>SSL Automático:</strong> Após validação, o SSL será provisionado automaticamente</li>
              <li>• <strong>Funciona com qualquer domínio:</strong> Apex domains e subdomínios são suportados</li>
              <li>• A propagação DNS pode levar de alguns minutos até 24 horas</li>
              <li>• O processo de validação pode levar alguns minutos após configurar ambos os registros</li>
              <li>• <strong>Ambos os registros são necessários:</strong> TXT para validação + CNAME para roteamento</li>
            </ul>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={onVerify}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar DNS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
      {children}
    </label>
  );
}
