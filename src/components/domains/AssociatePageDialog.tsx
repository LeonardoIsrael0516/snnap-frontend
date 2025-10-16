import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Link } from "lucide-react";
import { toast } from "sonner";
import { updateCustomDomain } from "@/lib/customDomains";
import { aiPagesService } from "@/lib/aiPages";

interface AssociatePageDialogProps {
  domain: {
    id: string;
    domain: string;
    type: 'LINK_AI' | 'BIOLINK';
    status: 'PENDING' | 'ACTIVE' | 'FAILED';
    pageId?: string | null;
    slug?: string | null;
    isRootDomain?: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface AIPage {
  id: string;
  title: string;
  slug: string;
}

export function AssociatePageDialog({
  domain,
  open,
  onOpenChange,
  onSuccess,
}: AssociatePageDialogProps) {
  const [pages, setPages] = useState<AIPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>(domain.pageId || "");
  const [customSlug, setCustomSlug] = useState<string>(domain.slug || "");
  const [useRootDomain, setUseRootDomain] = useState<boolean>(domain.isRootDomain || false);
  const [loading, setLoading] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);

  // Carregar páginas do usuário
  useEffect(() => {
    if (open && domain.type === 'LINK_AI') {
      loadPages();
    }
  }, [open, domain.type]);

  // Reset form quando dialog abre
  useEffect(() => {
    if (open) {
      setSelectedPageId(domain.pageId || "");
      setCustomSlug(domain.slug || "");
      setUseRootDomain(domain.isRootDomain || false);
    }
  }, [open, domain]);

  const loadPages = async () => {
    try {
      setLoadingPages(true);
      const response = await aiPagesService.list();
      setPages(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar páginas:", error);
      toast.error("Erro ao carregar páginas");
    } finally {
      setLoadingPages(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPageId) {
      toast.error("Selecione uma página");
      return;
    }

    try {
      setLoading(true);

      // Atualizar configurações do domínio
      await updateCustomDomain(domain.id, {
        pageId: selectedPageId,
        slug: useRootDomain ? null : (customSlug || null),
        isRootDomain: useRootDomain,
      });

      // Atualizar a página para referenciar o domínio
      await aiPagesService.update(selectedPageId, {
        customDomainId: domain.id,
      });

      toast.success("Página associada ao domínio com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao associar página:", error);
      toast.error(error.message || "Erro ao associar página ao domínio");
    } finally {
      setLoading(false);
    }
  };

  const selectedPage = pages.find(p => p.id === selectedPageId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Associar Página ao Domínio
          </DialogTitle>
          <DialogDescription>
            Configure qual página será exibida quando alguém acessar{" "}
            <code className="bg-muted px-1 rounded">{domain.domain}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleção da página */}
          <div className="space-y-2">
            <Label htmlFor="page-select">Página</Label>
            {loadingPages ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Carregando páginas...
              </div>
            ) : (
              <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma página" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Configuração de domínio raiz */}
          <div className="flex items-center space-x-2">
            <Switch
              id="root-domain"
              checked={useRootDomain}
              onCheckedChange={setUseRootDomain}
            />
            <Label htmlFor="root-domain" className="text-sm">
              Usar como domínio raiz
            </Label>
          </div>

          {useRootDomain ? (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Globe className="w-4 h-4" />
                <span>
                  A página será acessível diretamente em{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    https://{domain.domain}
                  </code>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="custom-slug">Slug personalizado (opcional)</Label>
              <Input
                id="custom-slug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder={selectedPage?.slug || "exemplo"}
              />
              <p className="text-xs text-muted-foreground">
                Se deixado em branco, usará o slug da página:{" "}
                <code className="bg-muted px-1 rounded">
                  {selectedPage?.slug || "slug-da-pagina"}
                </code>
              </p>
            </div>
          )}

          {/* Preview da URL */}
          {selectedPage && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <Link className="w-4 h-4" />
                <span>
                  URL final:{" "}
                  <code className="bg-green-100 dark:bg-green-900 px-1 rounded">
                    https://{domain.domain}
                    {useRootDomain ? "" : `/${customSlug || selectedPage.slug}`}
                  </code>
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedPageId}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Associar Página
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
