import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { storageService, UploadResult } from '@/lib/storage';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  label = 'Imagem',
  description,
  className = '',
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = storageService.isValidFileType(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Upload do arquivo
    setUploading(true);
    try {
      const result: UploadResult = await storageService.uploadFile(file, folder);
      
      if (result.success && result.url) {
        setPreview(result.url);
        onChange(result.url);
        toast.success('Imagem enviada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validation = storageService.isValidFileType(file);
      if (validation.valid) {
        handleFileSelect({ target: { files: [file] } } as any);
      } else {
        toast.error(validation.error);
      }
    }
  };

  // Remove image
  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file dialog
  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${preview ? 'border-green-200 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${uploading ? 'opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Enviando imagem...</p>
          </div>
        ) : preview ? (
          <div className="space-y-2">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 max-w-full rounded-lg object-cover"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-green-600">Imagem carregada com sucesso!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Clique para selecionar ou arraste uma imagem
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, GIF, WebP, SVG (máx. 10MB)
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
