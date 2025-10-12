import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Type, 
  Square, 
  Circle, 
  Image as ImageIcon, 
  Download, 
  Upload,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Move,
  Trash2,
  Copy,
  Layers,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Grid,
  Ruler
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface ImageBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  // Image specific
  imageUrl?: string;
  // Shape specific
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // Icon specific
  iconName?: string;
  iconColor?: string;
}

export function ImageBuilderModal({ open, onOpenChange, data, onChange }: ImageBuilderModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('elements');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  
  const {
    width = 800,
    height = 400,
    backgroundColor = '#ffffff',
    elements = [],
    backgroundImage = null,
    backgroundType = 'color'
  } = data;

  const addElement = (type: CanvasElement['type']) => {
    const newElement: CanvasElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: width / 2 - 50,
      y: height / 2 - 25,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 50 : 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length,
      // Default values based on type
      ...(type === 'text' && {
        text: 'Novo Texto',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left'
      }),
      ...(type === 'shape' && {
        shapeType: 'rectangle',
        fillColor: '#3b82f6',
        strokeColor: '#1e40af',
        strokeWidth: 2
      }),
      ...(type === 'icon' && {
        iconName: 'star',
        iconColor: '#fbbf24'
      })
    };

    onChange({
      ...data,
      elements: [...elements, newElement]
    });
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    onChange({
      ...data,
      elements: elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    });
  };

  const deleteElement = (id: string) => {
    onChange({
      ...data,
      elements: elements.filter(el => el.id !== id)
    });
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: elements.length
      };
      onChange({
        ...data,
        elements: [...elements, newElement]
      });
    }
  };

  const moveElement = (id: string, x: number, y: number) => {
    updateElement(id, { x, y });
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (e.target !== e.currentTarget) return;
    
    setSelectedElement(elementId);
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      moveElement(selectedElement, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderElement = (element: CanvasElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      zIndex: element.zIndex,
      cursor: isDragging ? 'grabbing' : 'grab',
      border: selectedElement === element.id ? '2px solid #3b82f6' : '2px solid transparent',
      borderRadius: '4px'
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div style={shapeStyle} />
          </div>
        );

      case 'icon':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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
              ⭐
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Builder de Imagem - Editor Avançado
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[70vh] gap-4">
          {/* Sidebar */}
          <div className="w-80 border-r border-border overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="elements">Elementos</TabsTrigger>
                <TabsTrigger value="background">Fundo</TabsTrigger>
                <TabsTrigger value="properties">Propriedades</TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="space-y-4 mt-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Adicionar Elementos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => addElement('text')}
                      className="flex items-center gap-2"
                    >
                      <Type className="w-4 h-4" />
                      Texto
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => addElement('image')}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Imagem
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => addElement('shape')}
                      className="flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Forma
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => addElement('icon')}
                      className="flex items-center gap-2"
                    >
                      <Circle className="w-4 h-4" />
                      Ícone
                    </Button>
                  </div>
                </Card>

                {elements.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Elementos ({elements.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {elements.map((element, index) => (
                        <div
                          key={element.id}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                            selectedElement === element.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                          }`}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {element.type === 'text' ? '📝' : 
                               element.type === 'image' ? '🖼️' : 
                               element.type === 'shape' ? '🔷' : '⭐'} {element.type}
                            </span>
                            {element.type === 'text' && (
                              <span className="text-xs text-gray-500 truncate max-w-32">
                                {element.text}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateElement(element.id);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="background" className="space-y-4 mt-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Configurações do Fundo</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Fundo</Label>
                      <Select 
                        value={backgroundType} 
                        onValueChange={(value) => onChange({ ...data, backgroundType: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="color">Cor Sólida</SelectItem>
                          <SelectItem value="image">Imagem</SelectItem>
                          <SelectItem value="gradient">Gradiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {backgroundType === 'color' && (
                      <div>
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
                    )}

                    {backgroundType === 'image' && (
                      <div>
                        <Label>Imagem de Fundo</Label>
                        <ImageUpload
                          value={backgroundImage || ''}
                          onChange={(url) => onChange({ ...data, backgroundImage: url })}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4 mt-4">
                {selectedElementData ? (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">
                      Propriedades - {selectedElementData.type}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Posição e Tamanho */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>X</Label>
                          <Input
                            type="number"
                            value={selectedElementData.x}
                            onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Y</Label>
                          <Input
                            type="number"
                            value={selectedElementData.y}
                            onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Largura</Label>
                          <Input
                            type="number"
                            value={selectedElementData.width}
                            onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Altura</Label>
                          <Input
                            type="number"
                            value={selectedElementData.height}
                            onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      {/* Opacidade e Rotação */}
                      <div className="space-y-3">
                        <div>
                          <Label>Opacidade: {Math.round(selectedElementData.opacity * 100)}%</Label>
                          <Slider
                            value={[selectedElementData.opacity]}
                            onValueChange={([value]) => updateElement(selectedElementData.id, { opacity: value })}
                            max={1}
                            min={0}
                            step={0.1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Rotação: {selectedElementData.rotation}°</Label>
                          <Slider
                            value={[selectedElementData.rotation]}
                            onValueChange={([value]) => updateElement(selectedElementData.id, { rotation: value })}
                            max={360}
                            min={-360}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      {/* Propriedades específicas do tipo */}
                      {selectedElementData.type === 'text' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Texto</Label>
                            <Input
                              value={selectedElementData.text || ''}
                              onChange={(e) => updateElement(selectedElementData.id, { text: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Tamanho da Fonte</Label>
                              <Input
                                type="number"
                                value={selectedElementData.fontSize || 24}
                                onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) || 24 })}
                              />
                            </div>
                            <div>
                              <Label>Família da Fonte</Label>
                              <Select 
                                value={selectedElementData.fontFamily || 'Arial'} 
                                onValueChange={(value) => updateElement(selectedElementData.id, { fontFamily: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Arial">Arial</SelectItem>
                                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                  <SelectItem value="Georgia">Georgia</SelectItem>
                                  <SelectItem value="Verdana">Verdana</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Peso da Fonte</Label>
                              <Select 
                                value={selectedElementData.fontWeight || 'normal'} 
                                onValueChange={(value) => updateElement(selectedElementData.id, { fontWeight: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="bold">Negrito</SelectItem>
                                  <SelectItem value="lighter">Leve</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Alinhamento</Label>
                              <Select 
                                value={selectedElementData.textAlign || 'left'} 
                                onValueChange={(value) => updateElement(selectedElementData.id, { textAlign: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Esquerda</SelectItem>
                                  <SelectItem value="center">Centro</SelectItem>
                                  <SelectItem value="right">Direita</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Cor do Texto</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={selectedElementData.color || '#000000'}
                                onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={selectedElementData.color || '#000000'}
                                onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                                placeholder="#000000"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedElementData.type === 'image' && (
                        <div>
                          <Label>URL da Imagem</Label>
                          <ImageUpload
                            value={selectedElementData.imageUrl || ''}
                            onChange={(url) => updateElement(selectedElementData.id, { imageUrl: url })}
                          />
                        </div>
                      )}

                      {selectedElementData.type === 'shape' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Tipo de Forma</Label>
                            <Select 
                              value={selectedElementData.shapeType || 'rectangle'} 
                              onValueChange={(value) => updateElement(selectedElementData.id, { shapeType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rectangle">Retângulo</SelectItem>
                                <SelectItem value="circle">Círculo</SelectItem>
                                <SelectItem value="triangle">Triângulo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Cor de Preenchimento</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  type="color"
                                  value={selectedElementData.fillColor || '#3b82f6'}
                                  onChange={(e) => updateElement(selectedElementData.id, { fillColor: e.target.value })}
                                  className="w-12 h-10 p-1"
                                />
                                <Input
                                  value={selectedElementData.fillColor || '#3b82f6'}
                                  onChange={(e) => updateElement(selectedElementData.id, { fillColor: e.target.value })}
                                  placeholder="#3b82f6"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Cor da Borda</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  type="color"
                                  value={selectedElementData.strokeColor || '#1e40af'}
                                  onChange={(e) => updateElement(selectedElementData.id, { strokeColor: e.target.value })}
                                  className="w-12 h-10 p-1"
                                />
                                <Input
                                  value={selectedElementData.strokeColor || '#1e40af'}
                                  onChange={(e) => updateElement(selectedElementData.id, { strokeColor: e.target.value })}
                                  placeholder="#1e40af"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Espessura da Borda: {selectedElementData.strokeWidth || 2}px</Label>
                            <Slider
                              value={[selectedElementData.strokeWidth || 2]}
                              onValueChange={([value]) => updateElement(selectedElementData.id, { strokeWidth: value })}
                              max={20}
                              min={0}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      )}

                      {selectedElementData.type === 'icon' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Ícone</Label>
                            <Select 
                              value={selectedElementData.iconName || 'star'} 
                              onValueChange={(value) => updateElement(selectedElementData.id, { iconName: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="star">⭐ Estrela</SelectItem>
                                <SelectItem value="heart">❤️ Coração</SelectItem>
                                <SelectItem value="like">👍 Curtir</SelectItem>
                                <SelectItem value="check">✅ Check</SelectItem>
                                <SelectItem value="cross">❌ Cruz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Cor do Ícone</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={selectedElementData.iconColor || '#fbbf24'}
                                onChange={(e) => updateElement(selectedElementData.id, { iconColor: e.target.value })}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={selectedElementData.iconColor || '#fbbf24'}
                                onChange={(e) => updateElement(selectedElementData.id, { iconColor: e.target.value })}
                                placeholder="#fbbf24"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4">
                    <p className="text-muted-foreground text-center py-8">
                      Selecione um elemento para editar suas propriedades
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button 
                  variant={showGrid ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={showRulers ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowRulers(!showRulers)}
                >
                  <Ruler className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-100 p-8 overflow-auto">
              <div className="inline-block">
                <div
                  ref={canvasRef}
                  style={{
                    width: width * zoom,
                    height: height * zoom,
                    backgroundColor: backgroundType === 'color' ? backgroundColor : 'transparent',
                    backgroundImage: showGrid ? 
                      `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px), ${backgroundType === 'image' && backgroundImage ? `url(${backgroundImage})` : 'none'}` :
                      backgroundType === 'image' && backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: showGrid ? 
                      '20px 20px, 20px 20px, cover' : 
                      'cover',
                    backgroundPosition: showGrid ? '0 0, 0 0, center' : 'center',
                    position: 'relative',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {elements.map(renderElement)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)} className="gradient-instagram text-white">
            Salvar Canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
