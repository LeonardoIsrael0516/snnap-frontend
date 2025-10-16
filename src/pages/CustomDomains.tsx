import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Plus,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  listCustomDomains,
  deleteCustomDomain,
  verifyCustomDomain,
  type CustomDomain,
} from "@/lib/customDomains";
import {
  AddDomainDialog,
  DNSInstructionsDialog,
} from "@/components/domains";

export default function CustomDomains() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<CustomDomain | null>(null);
  const [domainInfo, setDomainInfo] = useState<any>(null);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const data = await listCustomDomains();
      setDomains(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar domínios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      setVerifyingId(domainId);
      const result = await verifyCustomDomain(domainId);
      
      if (result.verification.verified) {
        toast({
          title: "Domínio verificado!",
          description: "Seu domínio foi configurado corretamente.",
        });
      } else {
        toast({
          title: "Verificação falhou",
          description: result.verification.error || "DNS ainda não configurado",
          variant: "destructive",
        });
      }
      
      await loadDomains();
    } catch (error: any) {
      toast({
        title: "Erro ao verificar domínio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("Tem certeza que deseja remover este domínio?")) {
      return;
    }

    try {
      await deleteCustomDomain(domainId);
      toast({
        title: "Domínio removido",
        description: "O domínio foi removido com sucesso.",
      });
      await loadDomains();
    } catch (error: any) {
      toast({
        title: "Erro ao remover domínio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Valor copiado para a área de transferência.",
    });
  };

  const getStatusBadge = (status: CustomDomain["status"]) => {
    const variants: Record<CustomDomain["status"], { variant: any; icon: any; label: string }> = {
      ACTIVE: {
        variant: "default",
        icon: Check,
        label: "Ativo",
      },
      PENDING: {
        variant: "secondary",
        icon: AlertCircle,
        label: "Pendente",
      },
      FAILED: {
        variant: "destructive",
        icon: X,
        label: "Falhou",
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: CustomDomain["type"]) => {
    return (
      <Badge variant="outline" className="font-mono">
        {type === "LINK_AI" ? "Snapylink" : "Biolink"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-6xl pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Meus Domínios
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Configure domínios personalizados para suas páginas
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="default" className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Domínio
        </Button>
      </div>

      {/* Lista de Domínios */}
      {domains.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum domínio cadastrado</h3>
          <p className="text-muted-foreground mb-6">
            Adicione seu primeiro domínio personalizado para começar
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Domínio
          </Button>
        </Card>
      ) : (
        <>
          {/* Informação sobre associação de páginas */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Como associar páginas aos domínios?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Para que seu domínio funcione, você precisa associar uma página a ele. 
                  Clique em <strong>"Criar Página"</strong> ou <strong>"Editar Página"</strong> 
                  e use o botão de domínio personalizado na página de edição.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <h3 className="text-lg md:text-xl font-semibold break-all">{domain.domain}</h3>
                    {getStatusBadge(domain.status)}
                    {getTypeBadge(domain.type)}
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                      <span className="text-muted-foreground flex-shrink-0">CNAME Target:</span>
                      <div className="flex items-center gap-2 flex-1 overflow-hidden">
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono break-all flex-1">
                          dns-d5a2h2r6.snnap.link
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("dns-d5a2h2r6.snnap.link")}
                          className="flex-shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>


                    {domain.verifiedAt && (
                      <p className="text-sm text-muted-foreground">
                        Verificado em:{" "}
                        {new Date(domain.verifiedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                    {/* Páginas usando este domínio */}
                    {domain.ai_pages && domain.ai_pages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">
                          Páginas usando este domínio:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {domain.ai_pages.map((page) => (
                            <Badge key={page.id} variant="secondary">
                              {page.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:ml-4">
                  {domain.status === 'ACTIVE' && domain.type === 'LINK_AI' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (domain.pageId) {
                          // Se já tem página associada, vai para edição
                          navigate(`/link-ai/create?id=${domain.pageId}`);
                        } else {
                          // Se não tem página, vai para criação
                          navigate('/link-ai/create');
                        }
                      }}
                      className="flex-1 sm:flex-initial"
                    >
                      <Globe className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">
                        {domain.pageId ? "Editar Página" : "Criar Página"}
                      </span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDomain(domain)}
                    className="flex-1 sm:flex-initial"
                  >
                    <ExternalLink className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Instruções DNS</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerifyDomain(domain.id)}
                    disabled={verifyingId === domain.id}
                    className="flex-1 sm:flex-initial"
                  >
                    <RefreshCw
                      className={`w-4 h-4 sm:mr-2 ${
                        verifyingId === domain.id ? "animate-spin" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">Verificar</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          </div>
        </>
      )}

      {/* Dialogs */}
      <AddDomainDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={(domainInfo) => {
          setDomainInfo(domainInfo);
          loadDomains();
        }}
      />

      {selectedDomain && (
        <DNSInstructionsDialog
          domain={selectedDomain}
          domainInfo={domainInfo}
          open={!!selectedDomain}
          onOpenChange={(open) => !open && setSelectedDomain(null)}
          onVerify={() => handleVerifyDomain(selectedDomain.id)}
        />
      )}

    </div>
  );
}
