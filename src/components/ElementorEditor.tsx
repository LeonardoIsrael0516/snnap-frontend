import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Save, 
  X, 
  Pencil, 
  Plus,
  Type,
  Image as ImageIcon,
  Square,
  Link2,
  Palette,
  Settings,
  Trash2,
  Move,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { aiPagesService } from "@/lib/aiPages";

interface ElementorEditorProps {
  pageId: string;
  initialHtml: string;
  onSave?: () => void;
}

interface DragElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'heading';
  content: string;
  styles: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    textAlign?: string;
    width?: string;
    height?: string;
  };
  href?: string;
}

const elementTemplates = {
  heading: {
    type: 'heading' as const,
    content: 'Novo Título',
    styles: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'center',
      padding: '20px',
      margin: '10px 0'
    }
  },
  text: {
    type: 'text' as const,
    content: 'Clique para editar este texto',
    styles: {
      fontSize: '16px',
      color: '#333333',
      padding: '10px',
      margin: '5px 0'
    }
  },
  button: {
    type: 'button' as const,
    content: 'Clique Aqui',
    styles: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '8px',
      textAlign: 'center',
      margin: '10px auto',
      width: 'fit-content',
      cursor: 'pointer'
    },
    href: '#'
  },
  image: {
    type: 'image' as const,
    content: 'https://via.placeholder.com/400x200?text=Sua+Imagem',
    styles: {
      width: '100%',
      maxWidth: '400px',
      height: 'auto',
      borderRadius: '8px',
      margin: '10px auto'
    }
  },
  container: {
    type: 'container' as const,
    content: '',
    styles: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      margin: '10px 0',
      borderRadius: '8px',
      minHeight: '100px'
    }
  }
};

export function ElementorEditor({ pageId, initialHtml, onSave }: ElementorEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [elements, setElements] = useState<DragElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [showElementEditor, setShowElementEditor] = useState(false);
  const [editingElement, setEditingElement] = useState<DragElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Extrair elementos do HTML inicial
  useEffect(() => {
    if (initialHtml && elements.length === 0) {
      // Por simplicidade, vamos começar com elementos vazios
      // Em uma implementação real, parseariamos o HTML para extrair elementos
      setElements([]);
    }
  }, [initialHtml]);

  // Gerar HTML a partir dos elementos
  const generateHtml = () => {
    const elementsHtml = elements.map(element => {
      const styleString = Object.entries(element.styles)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join('; ');

      switch (element.type) {
        case 'heading':
          return `<h1 style="${styleString}" data-element-id="${element.id}">${element.content}</h1>`;
        case 'text':
          return `<p style="${styleString}" data-element-id="${element.id}">${element.content}</p>`;
        case 'button':
          const href = element.href || '#';
          return `<a href="${href}" style="text-decoration: none;"><div style="${styleString}" data-element-id="${element.id}">${element.content}</div></a>`;
        case 'image':
          return `<img src="${element.content}" style="${styleString}" data-element-id="${element.id}" alt="Imagem">`;
        case 'container':
          return `<div style="${styleString}" data-element-id="${element.id}">
            <p style="text-align: center; color: #666; margin: 0;">Container - Arraste elementos aqui</p>
          </div>`;
        default:
          return '';
      }
    }).join('\n');

    // Se o HTML inicial tinha estrutura completa, preservar
    if (initialHtml.includes('<html') || initialHtml.includes('<!DOCTYPE')) {
      return initialHtml.replace(
        /<body[^>]*>[\s\S]*<\/body>/i,
        `<body style="margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh;">
          ${elementsHtml}
        </body>`
      );
    }

    return `
      <div style="margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; background: #ffffff;">
        ${elementsHtml}
      </div>
    `;
  };

  // Adicionar novo elemento
  const addElement = (type: keyof typeof elementTemplates, dropZone?: string) => {
    const template = elementTemplates[type];
    const newElement: DragElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...template
    };

    setElements(prev => [...prev, newElement]);
    toast.success(`${type === 'heading' ? 'Título' : type === 'text' ? 'Texto' : type === 'button' ? 'Botão' : type === 'image' ? 'Imagem' : 'Container'} adicionado!`);
  };

  // Remover elemento
  const removeElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
    toast.success("Elemento removido!");
  };

  // Duplicar elemento
  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      setElements(prev => [...prev, newElement]);
      toast.success("Elemento duplicado!");
    }
  };

  // Editar elemento
  const editElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      setEditingElement(element);
      setShowElementEditor(true);
    }
  };

  // Salvar edição do elemento
  const saveElementEdit = () => {
    if (editingElement) {
      setElements(prev => 
        prev.map(el => 
          el.id === editingElement.id ? editingElement : el
        )
      );
      setShowElementEditor(false);
      setEditingElement(null);
      toast.success("Elemento atualizado!");
    }
  };

  // Salvar página
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const html = generateHtml();
      await aiPagesService.update(pageId, {
        html_content: html,
      });
      toast.success("Página salva com sucesso!");
      setIsEditMode(false);
      onSave?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar página");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    setIsEditMode(false);
    setElements([]);
    setSelectedElement(null);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, type: string) => {
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedType) {
      addElement(draggedType as keyof typeof elementTemplates);
      setDraggedType(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-background">
      {/* Toolbar Principal */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {!isEditMode ? (
          <Button
            onClick={() => setIsEditMode(true)}
            className="shadow-lg"
            size="sm"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editor Visual
          </Button>
        ) : (
          <>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="shadow-lg"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="shadow-lg"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </>
        )}
      </div>

      {isEditMode ? (
        <div className="h-full flex bg-background">
          {/* Sidebar de Elementos */}
          <div className="w-80 border-r bg-white p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Elementos</h3>
            
            <div className="space-y-2">
              {/* Título */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'heading')}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Type className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Título</p>
                  <p className="text-xs text-gray-500">Adicionar título/heading</p>
                </div>
              </div>

              {/* Texto */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'text')}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Type className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Texto</p>
                  <p className="text-xs text-gray-500">Parágrafo de texto</p>
                </div>
              </div>

              {/* Botão */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'button')}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Square className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Botão</p>
                  <p className="text-xs text-gray-500">Botão com link</p>
                </div>
              </div>

              {/* Imagem */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'image')}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium">Imagem</p>
                  <p className="text-xs text-gray-500">Inserir imagem</p>
                </div>
              </div>

              {/* Container */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'container')}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Square className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Container</p>
                  <p className="text-xs text-gray-500">Seção/container</p>
                </div>
              </div>
            </div>

            {/* Lista de Elementos Adicionados */}
            {elements.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold mb-3">Elementos na Página</h4>
                <div className="space-y-2">
                  {elements.map((element, index) => (
                    <div
                      key={element.id}
                      className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                        selectedElement === element.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <span className="text-sm truncate">
                        {element.type === 'heading' ? '📄' : element.type === 'text' ? '📝' : element.type === 'button' ? '🔘' : element.type === 'image' ? '🖼️' : '📦'} 
                        {element.content.substring(0, 20)}...
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            editElement(element.id);
                          }}
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateElement(element.id);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeElement(element.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Área de Preview/Drop */}
          <div className="flex-1 bg-gray-100 relative">
            <div
              ref={previewRef}
              className="w-full h-full overflow-auto"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Área de Drop */}
              <div className="min-h-full bg-white m-4 rounded-lg shadow-sm border-2 border-dashed border-gray-300 relative">
                {elements.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Arraste elementos aqui</p>
                      <p className="text-sm">ou clique nos elementos da sidebar para começar</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {elements.map((element) => (
                      <div
                        key={element.id}
                        className={`relative group ${
                          selectedElement === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        {/* Elemento renderizado */}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: (() => {
                              const styleString = Object.entries(element.styles)
                                .map(([key, value]) => {
                                  const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                                  return `${cssKey}: ${value}`;
                                })
                                .join('; ');

                              switch (element.type) {
                                case 'heading':
                                  return `<h1 style="${styleString}">${element.content}</h1>`;
                                case 'text':
                                  return `<p style="${styleString}">${element.content}</p>`;
                                case 'button':
                                  return `<div style="${styleString}">${element.content}</div>`;
                                case 'image':
                                  return `<img src="${element.content}" style="${styleString}" alt="Imagem">`;
                                case 'container':
                                  return `<div style="${styleString}">
                                    <p style="text-align: center; color: #666; margin: 0;">Container - Clique para editar</p>
                                  </div>`;
                                default:
                                  return '';
                              }
                            })()
                          }}
                        />

                        {/* Controles do Elemento (aparecem no hover) */}
                        {selectedElement === element.id && (
                          <div className="absolute -top-8 left-0 flex gap-1 bg-white border rounded shadow-lg p-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                editElement(element.id);
                              }}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateElement(element.id);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeElement(element.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Visualização */
        <iframe
          srcDoc={generateHtml()}
          className="w-full h-full border-0"
          title="Page Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      )}

      {/* Modal de Edição de Elemento */}
      <Dialog open={showElementEditor} onOpenChange={setShowElementEditor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Elemento</DialogTitle>
          </DialogHeader>
          
          {editingElement && (
            <div className="space-y-4">
              {/* Conteúdo */}
              <div>
                <Label>Conteúdo</Label>
                {editingElement.type === 'image' ? (
                  <Input
                    value={editingElement.content}
                    onChange={(e) => setEditingElement(prev => prev ? {...prev, content: e.target.value} : null)}
                    placeholder="URL da imagem"
                  />
                ) : (
                  <Input
                    value={editingElement.content}
                    onChange={(e) => setEditingElement(prev => prev ? {...prev, content: e.target.value} : null)}
                    placeholder="Digite o texto"
                  />
                )}
              </div>

              {/* Link (para botões) */}
              {editingElement.type === 'button' && (
                <div>
                  <Label>Link (URL)</Label>
                  <Input
                    value={editingElement.href || ''}
                    onChange={(e) => setEditingElement(prev => prev ? {...prev, href: e.target.value} : null)}
                    placeholder="https://exemplo.com"
                  />
                </div>
              )}

              {/* Estilos */}
              <div className="grid grid-cols-2 gap-3">
                {/* Cor do Texto */}
                <div>
                  <Label>Cor do Texto</Label>
                  <Input
                    type="color"
                    value={editingElement.styles.color || '#000000'}
                    onChange={(e) => setEditingElement(prev => prev ? {
                      ...prev, 
                      styles: {...prev.styles, color: e.target.value}
                    } : null)}
                  />
                </div>

                {/* Cor de Fundo */}
                <div>
                  <Label>Cor de Fundo</Label>
                  <Input
                    type="color"
                    value={editingElement.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => setEditingElement(prev => prev ? {
                      ...prev, 
                      styles: {...prev.styles, backgroundColor: e.target.value}
                    } : null)}
                  />
                </div>

                {/* Tamanho da Fonte */}
                <div>
                  <Label>Tamanho da Fonte</Label>
                  <Input
                    value={editingElement.styles.fontSize?.replace('px', '') || '16'}
                    onChange={(e) => setEditingElement(prev => prev ? {
                      ...prev, 
                      styles: {...prev.styles, fontSize: e.target.value + 'px'}
                    } : null)}
                    placeholder="16"
                  />
                </div>

                {/* Espaçamento */}
                <div>
                  <Label>Espaçamento</Label>
                  <Input
                    value={editingElement.styles.padding?.replace('px', '') || '10'}
                    onChange={(e) => setEditingElement(prev => prev ? {
                      ...prev, 
                      styles: {...prev.styles, padding: e.target.value + 'px'}
                    } : null)}
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowElementEditor(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveElementEdit}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Indicador de Modo de Edição */}
      {isEditMode && (
        <div className="absolute bottom-4 left-4 z-50 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm shadow-lg">
          ✨ Editor Visual - Arraste e Solte
        </div>
      )}
    </div>
  );
}