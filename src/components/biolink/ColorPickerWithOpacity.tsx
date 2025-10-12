import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface ColorPickerWithOpacityProps {
  label: string;
  value: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
  placeholder?: string;
}

export function ColorPickerWithOpacity({ 
  label, 
  value, 
  opacity, 
  onChange, 
  placeholder = "#000000" 
}: ColorPickerWithOpacityProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Converter hex para rgba para mostrar no color picker
  const getColorForPicker = () => {
    if (value === 'transparent') return '#ffffff';
    return value || placeholder;
  };

  // Função para converter hex para rgba
  const hexToRgba = (hex: string, alpha: number) => {
    if (hex.startsWith('#')) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    }
    return hex;
  };

  const handleColorChange = (newColor: string) => {
    onChange(newColor, opacity);
  };

  const handleOpacityChange = (newOpacity: number) => {
    onChange(value, newOpacity);
  };

  const handleInputChange = (inputValue: string) => {
    if (inputValue === '' || inputValue === 'transparent') {
      onChange('transparent', 100);
    } else {
      onChange(inputValue, opacity);
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Color Picker Principal */}
      <div className="flex gap-2">
        <Input
          type="color"
          value={getColorForPicker()}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-12 h-10 p-1"
        />
        <Input
          value={value === 'transparent' ? 'transparent' : value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
      </div>

      {/* Slider de Opacidade */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Opacidade</span>
          <span className="text-sm font-medium">{opacity}%</span>
        </div>
        <Slider
          value={[opacity]}
          onValueChange={([value]) => handleOpacityChange(value)}
          max={100}
          min={0}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Preview da Cor */}
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded border border-gray-300"
          style={{
            backgroundColor: value === 'transparent' 
              ? 'transparent' 
              : hexToRgba(value, opacity)
          }}
        />
        <span className="text-xs text-muted-foreground">
          {value === 'transparent' 
            ? 'Transparente' 
            : hexToRgba(value, opacity)
          }
        </span>
      </div>
    </div>
  );
}
