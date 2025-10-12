import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Copy, Trash2, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { biolinksService, Biolink } from "@/lib/biolinks";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Biolinks() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [biolinks, setBiolinks] = useState<Biolink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSlug, setNewSlug] = useState("");

  useEffect(() => {
    loadBiolinks();
  }, []);

  const loadBiolinks = async () => {
    try {
      const data = await biolinksService.getAll();
      setBiolinks(data);
    } catch (error) {
      console.error(error);
      toast.error(t.biolinks.errorLoading);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBiolink = () => {
    setCreateModalOpen(true);
  };

  const handleConfirmCreate = () => {
    const finalSlug = newSlug.trim() || `biolink-${Date.now()}`;
    
    navigate("/biolink/editor", {
      state: { slug: finalSlug }
    });

    setNewSlug("");
    setCreateModalOpen(false);
  };

  const handleDuplicate = async (biolink: Biolink) => {
    try {
      const newSlug = `${biolink.slug}-copia-${Date.now()}`;
      await biolinksService.create({
        slug: newSlug,
        settings: biolink.settings,
        blocks: biolink.blocks,
      });
      toast.success(t.biolinks.duplicateSuccess);
      loadBiolinks();
    } catch (error) {
      toast.error(t.biolinks.errorDuplicating);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.biolinks.confirmDelete)) return;
    
    try {
      await biolinksService.delete(id);
      toast.success(t.biolinks.deleteSuccess);
      loadBiolinks();
    } catch (error) {
      toast.error(t.biolinks.errorDeleting);
    }
  };


  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-instagram-text">{t.biolinks.title}</h1>
        <p className="text-muted-foreground">
          {t.biolinks.description}
        </p>
      </div>

      {!isLoading && biolinks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full gradient-instagram flex items-center justify-center mb-6 glow-primary">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t.biolinks.createFirst}</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Construa páginas personalizadas com blocos de conteúdo arrastar e soltar
          </p>
          <Button onClick={handleCreateBiolink} size="lg" className="gradient-instagram text-white hover:opacity-90">
            <Plus className="w-5 h-5 mr-2" />
            {t.biolinks.createNew}
          </Button>
        </div>
      )}

      {!isLoading && biolinks.length > 0 && (
        <>
          <div className="mb-6">
            <Button onClick={handleCreateBiolink} size="lg" className="gradient-instagram text-white hover:opacity-90">
              <Plus className="w-5 h-5 mr-2" />
              {t.biolinks.createNew}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {biolinks.map(biolink => (
              <Card key={biolink.id} className="group hover:border-primary/50 transition-smooth overflow-hidden">
                <div className="h-32 relative overflow-hidden bg-muted">
                  <iframe 
                    src={`${import.meta.env.VITE_BIOLINK_API_URL?.replace('/api', '') || 'http://localhost:3003'}/${biolink.slug}`}
                    className="absolute inset-0 w-full h-full pointer-events-none scale-50 origin-top-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    style={{ width: '200%', height: '200%', overflow: 'hidden' }}
                    title={`Preview de ${biolink.slug}`}
                    scrolling="no"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">/{biolink.slug}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">{t.biolinks.link}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${import.meta.env.VITE_BIOLINK_API_URL?.replace('/api', '') || 'http://localhost:3003'}/${biolink.slug}`);
                        toast.success(t.biolinks.linkCopied);
                      }}
                      className="flex items-center gap-2 w-full text-xs font-mono text-primary hover-gradient p-2 rounded-md group"
                    >
                      <span className="truncate flex-1 text-left">
                        {import.meta.env.VITE_BIOLINK_API_URL?.replace('/api', '') || 'http://localhost:3003'}/{biolink.slug}
                      </span>
                      <Copy className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{biolink.views?.toLocaleString() || 0} {t.biolinks.views}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/biolink/editor/${biolink.id}`)} className="hover-gradient">
                      <Pencil className="w-3 h-3 mr-1" />
                      {t.biolinks.editBlock}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`${import.meta.env.VITE_BIOLINK_API_URL?.replace('/api', '') || 'http://localhost:3003'}/${biolink.slug}`, '_blank')} className="hover-gradient">
                      <Eye className="w-3 h-3 mr-1" />
                      {t.biolinks.viewBlock}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(biolink)} className="hover-gradient">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(biolink.id)} className="hover-gradient">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.biolinks.createNewBlock}</DialogTitle>
            <DialogDescription>
              {t.biolinks.slugDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) - Opcional</Label>
              <Input 
                id="slug" 
                placeholder={t.biolinks.slugPlaceholder} 
                value={newSlug} 
                onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
              />
              <p className="text-xs text-muted-foreground">
                {newSlug.trim() 
                  ? `Será acessível em: ${import.meta.env.VITE_BIOLINK_API_URL?.replace('/api', '') || 'http://localhost:3003'}/${newSlug}`
                  : t.biolinks.slugGenerated
                }
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleConfirmCreate} className="gradient-instagram text-white">
              {t.biolinks.createNewBlock}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
