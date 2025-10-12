import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface AdvancedColorPickerProps {
  label: string;
  value: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
  placeholder?: string;
}

export function AdvancedColorPicker({ 
  label, 
  value, 
  opacity, 
  onChange, 
  placeholder = "#000000" 
}: AdvancedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);

  // Converter HSL para Hex
  const hslToHex = (h: number, s: number, l: number) => {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    const r = hue2rgb(p, q, hNorm + 1/3);
    const g = hue2rgb(p, q, hNorm);
    const b = hue2rgb(p, q, hNorm - 1/3);

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Converter Hex para HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Inicializar valores HSL baseado na cor atual
  useEffect(() => {
    if (value && value !== 'transparent' && value.startsWith('#')) {
      const hsl = hexToHsl(value);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [value]);

  // Desenhar área de saturação/luminosidade
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Gradiente horizontal (saturação)
    const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
    saturationGradient.addColorStop(0, `hsl(${hue}, 0%, 50%)`);
    saturationGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);

    // Gradiente vertical (luminosidade)
    const lightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
    lightnessGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    lightnessGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    lightnessGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    lightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = lightnessGradient;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  // Desenhar slider de matiz
  useEffect(() => {
    const canvas = hueRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 6; i++) {
      gradient.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = Math.round((x / canvas.width) * 100);
    const newLightness = Math.round(100 - (y / canvas.height) * 100);

    setSaturation(newSaturation);
    setLightness(newLightness);

    const newColor = hslToHex(hue, newSaturation, newLightness);
    onChange(newColor, opacity);
  };

  const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newHue = Math.round((x / canvas.width) * 360);

    setHue(newHue);

    const newColor = hslToHex(newHue, saturation, lightness);
    onChange(newColor, opacity);
  };

  const handleOpacityChange = (newOpacity: number) => {
    // Garantir que 0% seja realmente 0
    const finalOpacity = newOpacity === 0 ? 0 : newOpacity;
    onChange(value, finalOpacity);
  };

  const handleInputChange = (inputValue: string) => {
    if (inputValue === '' || inputValue === 'transparent') {
      onChange('transparent', 100);
    } else if (inputValue.startsWith('#')) {
      onChange(inputValue, opacity);
      const hsl = hexToHsl(inputValue);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  };

  const currentColor = value === 'transparent' ? '#ffffff' : value;
  const currentHsl = value !== 'transparent' && value.startsWith('#') ? hexToHsl(value) : { h: hue, s: saturation, l: lightness };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Input de cor */}
      <div className="flex gap-2">
        <Input
          type="color"
          value={currentColor}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-12 h-10 p-1"
        />
        <Input
          value={value === 'transparent' ? 'transparent' : value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
      </div>

      {/* Seletor avançado */}
      <div className="space-y-3">
        {/* Área de saturação/luminosidade */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={200}
            height={150}
            className="w-full h-32 rounded border cursor-crosshair"
            onClick={handleCanvasClick}
          />
          {/* Indicador de posição atual */}
          <div
            className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
            style={{
              left: `${(currentHsl.s / 100) * 200 - 6}px`,
              top: `${((100 - currentHsl.l) / 100) * 150 - 6}px`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Slider de matiz */}
        <div className="relative">
          <canvas
            ref={hueRef}
            width={200}
            height={20}
            className="w-full h-5 rounded cursor-pointer"
            onClick={handleHueClick}
          />
          {/* Indicador de matiz atual */}
          <div
            className="absolute w-2 h-5 border border-white rounded pointer-events-none"
            style={{
              left: `${(currentHsl.h / 360) * 200 - 4}px`,
              top: '0px',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Slider de opacidade */}
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
      </div>

      {/* Preview da cor */}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border border-gray-300"
          style={{
            backgroundColor: value === 'transparent' || opacity === 0
              ? 'transparent' 
              : `rgba(${parseInt(value.slice(1, 3), 16)}, ${parseInt(value.slice(3, 5), 16)}, ${parseInt(value.slice(5, 7), 16)}, ${opacity / 100})`
          }}
        />
        <span className="text-xs text-muted-foreground">
          {value === 'transparent' || opacity === 0
            ? 'Transparente' 
            : `rgba(${parseInt(value.slice(1, 3), 16)}, ${parseInt(value.slice(3, 5), 16)}, ${parseInt(value.slice(5, 7), 16)}, ${opacity / 100})`
          }
        </span>
      </div>
    </div>
  );
}
