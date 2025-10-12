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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => void;
}

export function DNSInstructionsDialog({
  domain,
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
                  {domain.isApex ? (
                    <>Configure um registro <strong>CNAME</strong> (recomendado) ou <strong>A</strong> (alternativo) com as configurações abaixo:</>
                  ) : (
                    <>Adicione um novo registro <strong>CNAME</strong> com as seguintes configurações:</>
                  )}
                </span>
              </p>
            </div>

            {/* Configurações DNS - CNAME */}
            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                {domain.isApex && "Opção 1: "}Configuração CNAME {domain.isApex && "(Recomendado)"}
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome/Host</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      {domain.domain.includes(".") ? domain.domain.split(".")[0] : "@"}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          domain.domain.includes(".") ? domain.domain.split(".")[0] : "@",
                          "Nome/Host"
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use "@" para domínio raiz ou o subdomínio específico
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
                    Valor/Destino (Target)
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                      {domain.cnameTarget}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(domain.cnameTarget, "CNAME Target")
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
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

            {/* Configurações DNS - A Record (apenas para apex domains) */}
            {domain.isApex && domain.serverIp && (
              <Card className="p-4 bg-muted/50 mt-4">
                <h4 className="font-semibold mb-3">Opção 2: Configuração A Record (Alternativa)</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Use esta opção se seu provedor não suportar CNAME em domínio raiz
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome/Host</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                        @
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("@", "Nome/Host")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      @ representa o domínio raiz
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                        A
                      </code>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Valor/IP
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                        {domain.serverIp}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(domain.serverIp!, "IP do Servidor")
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">TTL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono">
                        3600 (ou Automático)
                      </code>
                    </div>
                  </div>
                </div>
              </Card>
            )}

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
              {domain.isApex ? (
                <>
                  <li>• <strong>Domínio Raiz:</strong> Alguns provedores não suportam CNAME em domínio raiz (@)</li>
                  <li>• Se CNAME não funcionar, use a configuração alternativa com A Record</li>
                  <li>• Alguns provedores (como Cloudflare) suportam CNAME flattening no raiz</li>
                </>
              ) : (
                <>
                  <li>• <strong>Subdomínio:</strong> Use sempre CNAME para subdomínios</li>
                  <li>• Alguns provedores podem exigir um ponto final no CNAME (ex: target.com.)</li>
                </>
              )}
              <li>• A propagação DNS pode levar de alguns minutos até 48 horas</li>
              <li>
                • Se estiver usando Cloudflare, desative o proxy (nuvem cinza) temporariamente para verificação
              </li>
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
