import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface ParagraphEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function ParagraphEditor({ data, onChange }: ParagraphEditorProps) {
  return (
    <div className="space-y-6">
      {/* Texto */}
      <div>
        <Label htmlFor="text">Texto do Parágrafo</Label>
        <Textarea
          id="text"
          value={data.text || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Digite seu texto aqui..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <Separator />

      {/* Cor do Texto */}
      <div>
        <Label htmlFor="color">Cor do Texto</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="color"
            type="color"
            value={data.color || '#000000'}
            onChange={(e) => onChange({ ...data, color: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={data.color || '#000000'}
            onChange={(e) => onChange({ ...data, color: e.target.value })}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <Separator />

      {/* Cor de Fundo */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="hasBackground">Fundo colorido</Label>
          <Switch
            id="hasBackground"
            checked={data.backgroundColor !== 'transparent' && data.backgroundColor !== undefined}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange({ ...data, backgroundColor: data.backgroundColor || '#f0f0f0', opacity: data.opacity || 100 });
              } else {
                onChange({ ...data, backgroundColor: 'transparent', opacity: 100 });
              }
            }}
          />
        </div>

        {data.backgroundColor !== 'transparent' && data.backgroundColor !== undefined && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="backgroundColor">Cor do Fundo</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={data.backgroundColor || '#f0f0f0'}
                  onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={data.backgroundColor || '#f0f0f0'}
                  onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
                  placeholder="#f0f0f0"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Slider de Opacidade */}
            <div>
              <Label htmlFor="opacity">Opacidade</Label>
              <div className="space-y-2 mt-1">
                <Slider
                  value={[data.opacity || 100]}
                  onValueChange={([value]) => onChange({ ...data, opacity: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="font-medium">{data.opacity || 100}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Border Radius */}
      <div>
        <Label htmlFor="borderRadius">Border Radius</Label>
        <div className="space-y-2 mt-1">
          <Slider
            value={[data.borderRadius || 0]}
            onValueChange={([value]) => onChange({ ...data, borderRadius: value })}
            max={50}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0px</span>
            <span className="font-medium">{data.borderRadius || 0}px</span>
            <span>50px</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Padding */}
      <div>
        <Label htmlFor="padding">Espaçamento Interno</Label>
        <div className="space-y-2 mt-1">
          <Slider
            value={[data.padding || 16]}
            onValueChange={([value]) => onChange({ ...data, padding: value })}
            max={50}
            min={0}
            step={2}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0px</span>
            <span className="font-medium">{data.padding || 16}px</span>
            <span>50px</span>
          </div>
        </div>
      </div>
    </div>
  );
}