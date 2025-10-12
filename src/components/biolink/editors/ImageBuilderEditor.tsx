import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Edit3, Eye } from "lucide-react";
import { ImageBuilderModal } from "../ImageBuilderModal";

interface ImageBuilderEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function ImageBuilderEditor({ data, onChange }: ImageBuilderEditorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  
  const {
    width = 800,
    height = 400,
    backgroundColor = '#ffffff',
    elements = [],
    backgroundImage = null,
    backgroundType = 'color'
  } = data;

  const renderPreview = () => {
    const renderElement = (element: any) => {
      const style: React.CSSProperties = {
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        zIndex: element.zIndex,
      };

      switch (element.type) {
        case 'text':
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  fontSize: element.fontSize,
                  fontFamily: element.fontFamily,
                  fontWeight: element.fontWeight,
                  color: element.color,
                  textAlign: element.textAlign,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start'
                }}
              >
                {element.text}
              </div>
            </div>
          );

        case 'image':
          return (
            <div key={element.id} style={style}>
              <img
                src={element.imageUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            </div>
          );

        case 'shape':
          const shapeStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            backgroundColor: element.fillColor,
            border: `${element.strokeWidth}px solid ${element.strokeColor}`,
            borderRadius: element.shapeType === 'circle' ? '50%' : element.shapeType === 'triangle' ? '0' : '4px',
            clipPath: element.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
          };

          return (
            <div key={element.id} style={style}>
              <div style={shapeStyle} />
            </div>
          );

        case 'icon':
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: Math.min(element.width, element.height) * 0.6,
                  color: element.iconColor
                }}
              >
                {element.iconName === 'star' ? '⭐' :
                 element.iconName === 'heart' ? '❤️' :
                 element.iconName === 'like' ? '👍' :
                 element.iconName === 'check' ? '✅' :
                 element.iconName === 'cross' ? '❌' : '⭐'}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div
        style={{
          width: Math.min(width, 300),
          height: Math.min(height, 150),
          backgroundColor: backgroundType === 'color' ? backgroundColor : 'transparent',
          backgroundImage: backgroundType === 'image' && backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          margin: '0 auto'
        }}
      >
        {elements.map(renderElement)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Preview do Canvas</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Abrir Editor
            </Button>
          </div>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 p-4">
          {elements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Canvas vazio</p>
              <p className="text-sm">Clique em "Abrir Editor" para começar a criar</p>
            </div>
          ) : (
            renderPreview()
          )}
        </div>
      </Card>

      {/* Configurações Básicas */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Configurações Básicas</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Largura (px)</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => onChange({ ...data, width: parseInt(e.target.value) || 800 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Altura (px)</Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => onChange({ ...data, height: parseInt(e.target.value) || 400 })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Cor de Fundo</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={backgroundColor}
              onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Elementos no Canvas</p>
              <p className="text-xs text-muted-foreground">{elements.length} elementos</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </Card>

      <ImageBuilderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        data={data}
        onChange={onChange}
      />
    </div>
  );
}