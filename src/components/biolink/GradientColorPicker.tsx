import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface GradientColorPickerProps {
  fromColor: string;
  toColor: string;
  onFromColorChange: (color: string) => void;
  onToColorChange: (color: string) => void;
}

export function GradientColorPicker({ 
  fromColor, 
  toColor, 
  onFromColorChange, 
  onToColorChange 
}: GradientColorPickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gradient-from">Cor Inicial</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="gradient-from"
              type="color"
              value={fromColor}
              onChange={(e) => onFromColorChange(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={fromColor}
              onChange={(e) => onFromColorChange(e.target.value)}
              placeholder="#667eea"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="gradient-to">Cor Final</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="gradient-to"
              type="color"
              value={toColor}
              onChange={(e) => onToColorChange(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={toColor}
              onChange={(e) => onToColorChange(e.target.value)}
              placeholder="#764ba2"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <Card className="p-4">
        <Label className="text-sm text-muted-foreground mb-2 block">Preview do Gradiente</Label>
        <div 
          className="w-full h-16 rounded-lg border"
          style={{
            background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`
          }}
        />
      </Card>
    </div>
  );
}
