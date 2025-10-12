import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { UploadService } from "@/lib/uploadService";

interface BiolinkImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number;
  id?: string;
}

export function BiolinkImageUpload({ 
  value, 
  onChange, 
  label = "Imagem",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  id
}: BiolinkImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    // Upload do arquivo
    setUploading(true);
    try {
      const result = await UploadService.uploadImage(file);
      
      if (result.success && result.url) {
        setPreview(result.url);
        onChange(result.url);
        toast.success('Imagem enviada com sucesso!');
      } else {
        toast.error('Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };


  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-16 h-16 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(id || `file-${label}`)?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? 'Enviando...' : 'Fazer Upload'}
        </Button>
        
        <input
          id={id || `file-${label}`}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

    </div>
  );
}