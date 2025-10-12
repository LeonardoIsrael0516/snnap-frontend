import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { BiolinkImageUpload } from "../BiolinkImageUpload";

interface AvatarEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function AvatarEditor({ data, onChange }: AvatarEditorProps) {
  // Garantir que os valores padrão existam
  const borderWidth = data.borderWidth || 0;
  const borderColor = data.borderColor || 'transparent';
  
  const hasBorder = borderWidth > 0;
  
  console.log('AvatarEditor - data:', data);
  console.log('AvatarEditor - borderWidth:', borderWidth);
  console.log('AvatarEditor - borderColor:', borderColor);
  console.log('AvatarEditor - hasBorder:', hasBorder);

  return (
    <div className="space-y-6">
      {/* Upload da Imagem */}
      <div>
        <BiolinkImageUpload
          value={data.imageUrl || ''}
          onChange={(url) => onChange({ ...data, imageUrl: url })}
          label="Avatar"
          description="Faça upload de uma imagem para o avatar"
        />
      </div>

      <Separator />

      {/* Texto Alternativo */}
      <div>
        <Label htmlFor="alt">Texto Alternativo</Label>
        <Input
          id="alt"
          value={data.alt || ''}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Descrição da imagem"
          className="mt-1"
        />
      </div>

      <Separator />

      {/* Forma do Avatar */}
      <div>
        <Label htmlFor="shape">Forma do Avatar</Label>
        <Select
          value={data.shape || 'circle'}
          onValueChange={(value) => onChange({ ...data, shape: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="circle">Círculo</SelectItem>
            <SelectItem value="square">Quadrado</SelectItem>
            <SelectItem value="rounded">Bordas Arredondadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Borda */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="hasBorder">Borda</Label>
          <Switch
            id="hasBorder"
            checked={hasBorder}
            onCheckedChange={(checked) => {
              console.log('Switch clicked - checked:', checked);
              if (checked) {
                const newData = { 
                  ...data, 
                  borderColor: '#000000', 
                  borderWidth: 2 
                };
                console.log('Enabling border - newData:', newData);
                onChange(newData);
              } else {
                const newData = { 
                  ...data, 
                  borderColor: 'transparent', 
                  borderWidth: 0 
                };
                console.log('Disabling border - newData:', newData);
                onChange(newData);
              }
            }}
          />
        </div>

        {hasBorder && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="borderColor">Cor da Borda</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="borderColor"
                  type="color"
                  value={borderColor === 'transparent' ? '#000000' : borderColor}
                  onChange={(e) => onChange({ ...data, borderColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={borderColor === 'transparent' ? '#000000' : borderColor}
                  onChange={(e) => onChange({ ...data, borderColor: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="borderWidth">Espessura da Borda</Label>
              <div className="space-y-2 mt-1">
                <Slider
                  value={[borderWidth]}
                  onValueChange={([value]) => onChange({ ...data, borderWidth: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1px</span>
                  <span className="font-medium">{borderWidth}px</span>
                  <span>10px</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Preview */}
      {data.imageUrl && (
        <div className="flex justify-center">
          <div
            className="overflow-hidden"
            style={{
              borderRadius: data.shape === 'circle' 
                ? '50%' 
                : data.shape === 'rounded' 
                  ? '12px' 
                  : '0px',
              border: hasBorder 
                ? `${borderWidth}px solid ${borderColor === 'transparent' ? '#000000' : borderColor}` 
                : 'none'
            }}
          >
            <img
              src={data.imageUrl}
              alt={data.alt}
              className="w-32 h-32 object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}