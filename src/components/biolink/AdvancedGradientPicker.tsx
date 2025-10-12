import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface AdvancedGradientPickerProps {
  gradientFrom: string;
  gradientTo: string;
  gradientMiddle?: string;
  gradientType: 'linear' | 'radial' | 'conic';
  gradientDirection: string;
  onFromColorChange: (color: string) => void;
  onToColorChange: (color: string) => void;
  onMiddleColorChange: (color: string) => void;
  onTypeChange: (type: 'linear' | 'radial' | 'conic') => void;
  onDirectionChange: (direction: string) => void;
  onRemoveMiddleColor: () => void;
}

export function AdvancedGradientPicker({ 
  gradientFrom, 
  gradientTo, 
  gradientMiddle,
  gradientType,
  gradientDirection,
  onFromColorChange, 
  onToColorChange, 
  onMiddleColorChange,
  onTypeChange,
  onDirectionChange,
  onRemoveMiddleColor
}: AdvancedGradientPickerProps) {
  const [hasMiddleColor, setHasMiddleColor] = useState(!!gradientMiddle);

  const handleAddMiddleColor = () => {
    setHasMiddleColor(true);
    if (!gradientMiddle) {
      // Gerar cor intermediária automaticamente
      const fromRgb = hexToRgb(gradientFrom);
      const toRgb = hexToRgb(gradientTo);
      if (fromRgb && toRgb) {
        const middleRgb = {
          r: Math.round((fromRgb.r + toRgb.r) / 2),
          g: Math.round((fromRgb.g + toRgb.g) / 2),
          b: Math.round((fromRgb.b + toRgb.b) / 2)
        };
        onMiddleColorChange(rgbToHex(middleRgb));
      }
    }
  };

  const handleRemoveMiddleColor = () => {
    setHasMiddleColor(false);
    onRemoveMiddleColor();
  };

  const generateGradientCSS = () => {
    let colors = [gradientFrom];
    if (hasMiddleColor && gradientMiddle) {
      colors = [gradientFrom, gradientMiddle, gradientTo];
    } else {
      colors = [gradientFrom, gradientTo];
    }

    const colorStops = colors.map((color, index) => {
      if (hasMiddleColor && gradientMiddle && colors.length === 3) {
        const positions = ['0%', '50%', '100%'];
        return `${color} ${positions[index]}`;
      } else {
        const positions = ['0%', '100%'];
        return `${color} ${positions[index]}`;
      }
    }).join(', ');

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${gradientDirection}, ${colorStops})`;
      case 'radial':
        return `radial-gradient(${gradientDirection}, ${colorStops})`;
      case 'conic':
        return `conic-gradient(${gradientDirection}, ${colorStops})`;
      default:
        return `linear-gradient(${gradientDirection}, ${colorStops})`;
    }
  };

  const predefinedDirections = {
    linear: [
      { value: 'to right', label: '→ Direita' },
      { value: 'to left', label: '← Esquerda' },
      { value: 'to bottom', label: '↓ Baixo' },
      { value: 'to top', label: '↑ Cima' },
      { value: '45deg', label: '↗ Diagonal' },
      { value: '135deg', label: '↘ Diagonal' },
      { value: '225deg', label: '↙ Diagonal' },
      { value: '315deg', label: '↖ Diagonal' }
    ],
    radial: [
      { value: 'circle at center', label: 'Círculo no centro' },
      { value: 'ellipse at center', label: 'Elipse no centro' },
      { value: 'circle at top', label: 'Círculo no topo' },
      { value: 'circle at bottom', label: 'Círculo embaixo' },
      { value: 'circle at left', label: 'Círculo à esquerda' },
      { value: 'circle at right', label: 'Círculo à direita' }
    ],
    conic: [
      { value: 'from 0deg', label: '0° (topo)' },
      { value: 'from 90deg', label: '90° (direita)' },
      { value: 'from 180deg', label: '180° (baixo)' },
      { value: 'from 270deg', label: '270° (esquerda)' },
      { value: 'from 45deg', label: '45°' },
      { value: 'from 135deg', label: '135°' }
    ]
  };

  return (
    <div className="space-y-4">
      {/* Tipo de Gradiente */}
      <div>
        <Label className="text-sm font-medium">Tipo de Gradiente</Label>
        <Select value={gradientType} onValueChange={(value: 'linear' | 'radial' | 'conic') => onTypeChange(value)}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="radial">Radial</SelectItem>
            <SelectItem value="conic">Cônico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Direção */}
      <div>
        <Label className="text-sm font-medium">Direção</Label>
        <Select value={gradientDirection} onValueChange={onDirectionChange}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {predefinedDirections[gradientType].map((dir) => (
              <SelectItem key={dir.value} value={dir.value}>
                {dir.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cores */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gradient-from">Cor Inicial</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="gradient-from"
                type="color"
                value={gradientFrom}
                onChange={(e) => onFromColorChange(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={gradientFrom}
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
                value={gradientTo}
                onChange={(e) => onToColorChange(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={gradientTo}
                onChange={(e) => onToColorChange(e.target.value)}
                placeholder="#764ba2"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Cor Intermediária */}
        {hasMiddleColor ? (
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="gradient-middle">Cor Intermediária</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveMiddleColor}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                id="gradient-middle"
                type="color"
                value={gradientMiddle || '#000000'}
                onChange={(e) => onMiddleColorChange(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={gradientMiddle || ''}
                onChange={(e) => onMiddleColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMiddleColor}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Cor Intermediária
          </Button>
        )}
      </div>

      {/* Preview */}
      <Card className="p-4">
        <Label className="text-sm text-muted-foreground mb-2 block">Preview do Gradiente</Label>
        <div 
          className="w-full h-20 rounded-lg border"
          style={{
            background: generateGradientCSS()
          }}
        />
        <div className="mt-2 text-xs text-muted-foreground font-mono">
          {generateGradientCSS()}
        </div>
      </Card>
    </div>
  );
}

// Funções auxiliares para conversão de cores
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

