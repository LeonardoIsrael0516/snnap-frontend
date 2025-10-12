import { useState, useEffect } from "react";
import { Globe, ExternalLink, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  getActiveDomains, 
  updateCustomDomain,
  type CustomDomain 
} from "@/lib/customDomains";

interface CustomDomainSelectorProps {
  pageType: "LINK_AI" | "BIOLINK";
  pageId?: string;
  currentDomainId?: string | null;
  onDomainChange: (domainId: string | null) => void;
}

export function CustomDomainSelector({
  pageType,
  pageId,
  currentDomainId,
  onDomainChange,
}: CustomDomainSelectorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(
    currentDomainId || null
  );
  const [customSlug, setCustomSlug] = useState<string>("");
  const [useRootDomain, setUseRootDomain] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      console.log('🔓 Modal aberto, carregando domínios...');
      // Carregar domínios e aguardar para garantir dados frescos
      loadDomains().then(() => {
        console.log('✅ Domínios recarregados ao abrir modal');
      });
    }
  }, [open, pageType]);

  // Carregar domínios na inicialização para mostrar o selecionado
  useEffect(() => {
    console.log('🔄 Componente montado, carregando domínios iniciais');
    loadDomains();
  }, [pageType]);

  // Atualizar estado quando domínios são carregados ou currentDomainId muda
  useEffect(() => {
    setSelectedDomainId(currentDomainId || null);
    console.log('🔄 CustomDomainSelector: currentDomainId mudou:', currentDomainId);
    console.log('🔄 CustomDomainSelector: selectedDomainId atualizado para:', currentDomainId || null);
    
    // Carregar configurações do domínio selecionado DOS DADOS ATUALIZADOS
    if (currentDomainId && domains.length > 0) {
      const domain = domains.find(d => d.id === currentDomainId);
      console.log('🔍 Domínio encontrado nos dados:', domain);
      if (domain) {
        console.log('📝 Atualizando estado:', { slug: domain.slug, isRootDomain: domain.isRootDomain });
        setCustomSlug(domain.slug || "");
        setUseRootDomain(domain.isRootDomain || false);
      }
    } else if (!currentDomainId) {
      setCustomSlug("");
      setUseRootDomain(false);
    }
  }, [currentDomainId, domains]);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const activeDomains = await getActiveDomains(pageType);
      setDomains(activeDomains);
      console.log('✅ CustomDomainSelector: Domínios carregados:', activeDomains.length);
      console.log('✅ CustomDomainSelector: currentDomainId:', currentDomainId);
      console.log('✅ CustomDomainSelector: selectedDomainId:', selectedDomainId);
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

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validação: Se está tentando usar domínio raiz, verificar se já está em uso
      if (selectedDomainId && useRootDomain && pageId) {
        console.log('🔍 Validando domínio raiz antes de salvar...');
        console.log('🔍 Estado atual:', { selectedDomainId, useRootDomain, pageId });
        console.log('🔍 Domínios disponíveis:', domains.map(d => ({ 
          id: d.id, 
          domain: d.domain, 
          isRootDomain: d.isRootDomain, 
          pageId: d.pageId 
        })));
        
        const selectedDomain = domains.find(d => d.id === selectedDomainId);
        
        if (selectedDomain) {
          // Verificar se há outro domínio com mesmo domain name usando root domain
          const conflictingDomain = domains.find(d => 
            d.domain === selectedDomain.domain && 
            d.isRootDomain === true && 
            d.pageId !== pageId // Inclui registros órfãos (pageId = null)
          );

          console.log('🔍 Domínio conflitante encontrado?', conflictingDomain);

          if (conflictingDomain) {
            console.log('❌ CONFLITO DETECTADO:', conflictingDomain);
            const conflictMessage = conflictingDomain.pageId 
              ? `Outra página (${conflictingDomain.pageId}) já está configurada para usar o domínio raiz de ${selectedDomain.domain}.`
              : `Existe uma configuração órfã de domínio raiz para ${selectedDomain.domain}. Recarregue a página e tente novamente.`;
            
            toast({
              title: "Domínio raiz já está em uso",
              description: conflictMessage,
              variant: "destructive",
            });
            setSaving(false);
            return;
          }
        }
      }

      // Se selecionou um domínio, atualizar as configurações de slug
      if (selectedDomainId && pageId) {
        await updateCustomDomain(selectedDomainId, {
          slug: useRootDomain ? null : (customSlug || null),
          isRootDomain: useRootDomain,
          pageId: pageId,
        });
        
        // Recarregar domínios para garantir que os dados estão atualizados
        await loadDomains();
      }

      // Se removendo domínio (selectedDomainId = null), precisamos limpar registros antigos
      if (!selectedDomainId && currentDomainId) {
        console.log('🧹 Removendo domínio, limpando pageId do registro anterior:', currentDomainId);
        try {
          await updateCustomDomain(currentDomainId, {
            slug: null,
            isRootDomain: false,
            pageId: null, // Remove a associação com a página
          });
          await loadDomains();
        } catch (error) {
          console.error('❌ Erro ao limpar registro anterior:', error);
        }
      }

      onDomainChange(selectedDomainId);
      toast({
        title: selectedDomainId ? "Domínio configurado!" : "Domínio removido",
        description: selectedDomainId
          ? useRootDomain
            ? "Sua página agora usa o domínio raiz."
            : `Sua página agora usa o domínio personalizado${customSlug ? ` com slug: ${customSlug}` : ""}.`
          : "Sua página voltou a usar a slug padrão.",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao configurar domínio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedDomain = domains.find((d) => d.id === selectedDomainId);

  console.log('🎨 CustomDomainSelector render:', {
    selectedDomainId,
    domainsCount: domains.length,
    selectedDomain: selectedDomain?.domain,
    currentDomainId,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="w-4 h-4 mr-2" />
          {selectedDomain ? selectedDomain.domain : "Domínio Personalizado"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Domínio Personalizado</DialogTitle>
          <DialogDescription>
            Configure um domínio personalizado para esta página
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Carregando domínios...
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Você ainda não possui domínios ativos configurados
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate("/dominios");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Domínio
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="domain-select">Selecione um domínio</Label>
                <Select
                  key={`domain-select-${selectedDomainId || 'none'}-${domains.length}`}
                  value={selectedDomainId || "none"}
                  onValueChange={(value) => {
                    const newId = value === "none" ? null : value;
                    setSelectedDomainId(newId);
                    
                    // Resetar configurações ao mudar domínio - SEMPRE usa dados atuais
                    if (newId) {
                      const domain = domains.find(d => d.id === newId);
                      console.log('🔄 Domínio selecionado mudou para:', domain);
                      if (domain) {
                        console.log('📝 Configurando estado:', { slug: domain.slug, isRootDomain: domain.isRootDomain, pageId: domain.pageId });
                        setCustomSlug(domain.slug || "");
                        setUseRootDomain(domain.isRootDomain === true); // Força boolean
                      }
                    } else {
                      console.log('🔄 Domínio desmarcado');
                      setCustomSlug("");
                      setUseRootDomain(false);
                    }
                  }}
                >
                  <SelectTrigger id="domain-select">
                    <SelectValue placeholder="Usar slug padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      🔗 Usar slug padrão (sem domínio personalizado)
                    </SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id}>
                        🌐 {domain.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDomainId && selectedDomain && (
                <div className="space-y-4">
                  {(() => {
                    // Verificar se já existe outro domínio usando root domain
                    const hasRootDomainConflict = domains.some(d => 
                      d.domain === selectedDomain.domain && 
                      d.isRootDomain === true && 
                      d.pageId !== pageId // Inclui registros órfãos (pageId = null)
                    );

                    return (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="use-root"
                            checked={useRootDomain}
                            disabled={hasRootDomainConflict && !useRootDomain}
                            onCheckedChange={(checked) => {
                              console.log('🔄 useRootDomain mudou de', useRootDomain, 'para', checked);
                              setUseRootDomain(checked as boolean);
                              if (checked) {
                                setCustomSlug("");
                              }
                            }}
                          />
                          <Label
                            htmlFor="use-root"
                            className={`text-sm font-normal ${hasRootDomainConflict && !useRootDomain ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          >
                            Usar domínio raiz (sem slug)
                          </Label>
                        </div>

                        {hasRootDomainConflict && !useRootDomain && (
                          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            ⚠️ Domínio raiz já está em uso por outra página. Remova a configuração da outra página primeiro.
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {!useRootDomain && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-slug">
                        Slug personalizado (opcional)
                      </Label>
                      <Input
                        id="custom-slug"
                        placeholder="minha-pagina"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe vazio para usar o slug padrão da página
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-sm font-medium">URL final:</p>
                    <p className="text-sm text-muted-foreground break-all">
                      https://{selectedDomain.domain}
                      {!useRootDomain && (customSlug ? `/${customSlug}` : "/[slug-da-página]")}
                    </p>
                    {useRootDomain && (
                      <p className="text-xs text-yellow-600">
                        ⚠️ Apenas uma página pode usar o domínio raiz
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    navigate("/dominios");
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Gerenciar domínios
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    size="sm"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
