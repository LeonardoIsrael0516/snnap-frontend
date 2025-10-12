import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { BiolinkImageUpload } from "../BiolinkImageUpload";

interface ImageEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function ImageEditor({ data, onChange }: ImageEditorProps) {
  const columns = data.columns || 1;
  const size = data.size || 'banner';
  const images = data.images || [{ imageUrl: '', alt: 'Imagem', link: '' }];

  const getImageDimensions = () => {
    switch (size) {
      case 'banner':
        return { width: '400px', height: '200px' };
      case 'rectangle':
        return { width: '300px', height: '150px' };
      case 'square':
        return { width: '200px', height: '200px' };
      default:
        return { width: '400px', height: '200px' };
    }
  };

  const getImageClasses = () => {
    const dimensions = getImageDimensions();
    return `object-cover rounded-lg`;
  };

  const addImage = () => {
    const newImages = [...images, { imageUrl: '', alt: 'Imagem', link: '' }];
    onChange({ ...data, images: newImages });
  };

  const removeImage = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      onChange({ ...data, images: newImages });
    }
  };

  const updateImage = (index: number, field: string, value: string) => {
    console.log('🔄 updateImage called:', { index, field, value });
    console.log('📸 Current images before update:', images);
    
    const newImages = [...images]; // Criar uma cópia do array
    newImages[index] = { ...newImages[index], [field]: value }; // Atualizar apenas o item específico
    
    console.log('📸 New images after update:', newImages);
    onChange({ ...data, images: newImages });
  };

  const handleColumnsChange = (value: string) => {
    const newColumns = parseInt(value);
    
    // Se mudou para múltiplas colunas e só tem 1 imagem, adiciona mais
    if (newColumns > 1 && images.length === 1) {
      const newImages = [...images];
      for (let i = 1; i < newColumns; i++) {
        newImages.push({ imageUrl: '', alt: 'Imagem', link: '' });
      }
      onChange({ ...data, columns: newColumns, images: newImages });
    } else {
      onChange({ ...data, columns: newColumns });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tamanho da Imagem */}
      <div>
        <Label htmlFor="size">Tamanho da Imagem</Label>
        <Select
          value={size}
          onValueChange={(value) => onChange({ ...data, size: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="banner">Banner (400x200px)</SelectItem>
            <SelectItem value="rectangle">Retângulo (300x150px)</SelectItem>
            <SelectItem value="square">Quadrado (200x200px)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Tamanho fixo em pixels para evitar cortes
        </p>
      </div>

      <Separator />

      {/* Colunas */}
      <div>
        <Label htmlFor="columns">Colunas</Label>
        <Select
          value={columns.toString()}
          onValueChange={handleColumnsChange}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Coluna</SelectItem>
            <SelectItem value="2">2 Colunas</SelectItem>
            <SelectItem value="3">3 Colunas</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          {columns === 1 
            ? 'A imagem será exibida em uma coluna' 
            : `As imagens serão exibidas em ${columns} colunas lado a lado`
          }
        </p>
      </div>

      <Separator />

      {/* Imagens */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Imagens ({images.length})</Label>
          {columns > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImage}
              disabled={images.length >= columns * 3} // Máximo 3 imagens por coluna
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Imagem
            </Button>
          )}
        </div>

        {images.map((image, index) => (
          <div key={`image-${index}-${image.imageUrl || 'empty'}`} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Imagem {index + 1}</h4>
              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div>
              <BiolinkImageUpload
                value={image.imageUrl || ''}
                onChange={(url) => updateImage(index, 'imageUrl', url)}
                label="Upload da Imagem"
                description="Faça upload de uma imagem"
                id={`image-upload-${index}`}
              />
            </div>

            <div>
              <Label htmlFor={`alt-${index}`}>Texto Alternativo</Label>
              <Input
                id={`alt-${index}`}
                value={image.alt || ''}
                onChange={(e) => updateImage(index, 'alt', e.target.value)}
                placeholder="Descrição da imagem"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`link-${index}`}>Link (opcional)</Label>
              <Input
                id={`link-${index}`}
                value={image.link || ''}
                onChange={(e) => updateImage(index, 'link', e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            {/* Preview da imagem individual */}
            {image.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={image.imageUrl}
                  alt={image.alt}
                  className={getImageClasses()}
                  style={getImageDimensions()}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* Preview do layout final */}
      {images.some(img => img.imageUrl) && (
        <div>
          <Label>Preview do Layout</Label>
          <div className="mt-2 flex justify-center">
            <div className={`${columns > 1 ? 'biolink-grid' : ''} ${columns === 2 ? 'biolink-grid-2' : columns === 3 ? 'biolink-grid-3' : ''}`}>
              {images.slice(0, columns).map((image, index) => (
                <div key={index} className="flex justify-center">
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={image.alt}
                      className={getImageClasses()}
                      style={getImageDimensions()}
                    />
                  ) : (
                    <div 
                      className="bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
                      style={getImageDimensions()}
                    >
                      Imagem {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}