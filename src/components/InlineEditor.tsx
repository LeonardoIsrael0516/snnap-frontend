import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Pencil, Palette } from "lucide-react";
import { toast } from "sonner";
import { aiPagesService } from "@/lib/aiPages";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InlineEditorProps {
  pageId: string;
  initialHtml: string;
  onSave?: () => void;
}

export function InlineEditor({ pageId, initialHtml, onSave }: InlineEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [html, setHtml] = useState(initialHtml);
  const [isSaving, setIsSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentBgColor, setCurrentBgColor] = useState("#ffffff");
  const [currentLink, setCurrentLink] = useState("");
  const [gradientColor1, setGradientColor1] = useState("#ff0000");
  const [gradientColor2, setGradientColor2] = useState("#0000ff");
  const [gradientDirection, setGradientDirection] = useState("to right");

  useEffect(() => {
    setHtml(initialHtml);
  }, [initialHtml]);

  useEffect(() => {
    if (isEditMode && iframeRef.current?.contentWindow) {
      const iframeDoc = iframeRef.current.contentWindow.document;
      
      // Check if styles already exist
      const existingStyle = iframeDoc.getElementById('inline-edit-styles');
      if (existingStyle) return;
      
      // Add editing styles
      const style = iframeDoc.createElement('style');
      style.id = 'inline-edit-styles';
      style.textContent = `
        .inline-edit-hover {
          outline: 2px dashed #3b82f6 !important;
          cursor: pointer !important;
        }
        .inline-edit-selected {
          outline: 3px solid #3b82f6 !important;
          position: relative !important;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Add click listeners to all editable elements including cards
      const elements = iframeDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, div, section, article, header, footer');
      elements.forEach((el) => {
        const element = el as HTMLElement;
        
        element.addEventListener('mouseenter', () => {
          if (!selectedElement) {
            element.classList.add('inline-edit-hover');
          }
        });
        
        element.addEventListener('mouseleave', () => {
          element.classList.remove('inline-edit-hover');
        });
        
        element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Remove previous selection
          if (selectedElement) {
            selectedElement.classList.remove('inline-edit-selected');
          }
          
          // Select new element
          element.classList.add('inline-edit-selected');
          setSelectedElement(element);
          setEditingText(element.textContent || "");
          
          // Get current colors
          const computedStyle = window.getComputedStyle(element);
          const textColor = computedStyle.color;
          const bgColor = computedStyle.backgroundColor;
          const bgImage = computedStyle.backgroundImage;
          
          // Convert rgb to hex
          const rgbToHex = (rgb: string) => {
            const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (match) {
              const hex = (x: string) => ("0" + parseInt(x).toString(16)).slice(-2);
              return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
            }
            return rgb;
          };
          
          setCurrentTextColor(textColor.startsWith('rgb') ? rgbToHex(textColor) : textColor);
          setCurrentBgColor(bgColor.startsWith('rgb') ? rgbToHex(bgColor) : bgColor);
          
          // Get link if it's an anchor tag or button with onclick
          if (element.tagName === 'A') {
            setCurrentLink((element as HTMLAnchorElement).href || "");
          } else if (element.tagName === 'BUTTON') {
            const onclick = element.getAttribute('onclick');
            if (onclick && onclick.includes('location.href')) {
              const match = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
              setCurrentLink(match ? match[1] : "");
            } else {
              setCurrentLink("");
            }
          } else {
            setCurrentLink("");
          }
          
          setShowTextEditor(true);
        });
      });
    }
  }, [isEditMode]);

  const handleSaveText = () => {
    if (selectedElement && iframeRef.current?.contentWindow) {
      selectedElement.textContent = editingText;
      setShowTextEditor(false);
      setSelectedElement(null);
      toast.success("Texto atualizado!");
    }
  };

  const handleChangeColor = (color: string, property: 'color' | 'backgroundColor') => {
    if (selectedElement) {
      selectedElement.style[property] = color;
      if (property === 'color') {
        setCurrentTextColor(color);
      } else {
        setCurrentBgColor(color);
      }
      toast.success("Cor atualizada!");
    }
  };

  const handleApplyGradient = () => {
    if (selectedElement) {
      const gradient = `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`;
      selectedElement.style.backgroundImage = gradient;
      toast.success("Gradiente aplicado!");
    }
  };

  const handleSaveLink = () => {
    if (selectedElement) {
      if (selectedElement.tagName === 'A') {
        (selectedElement as HTMLAnchorElement).href = currentLink;
        toast.success("Link atualizado!");
      } else if (selectedElement.tagName === 'BUTTON') {
        if (currentLink) {
          selectedElement.setAttribute('onclick', `location.href='${currentLink}'`);
          selectedElement.style.cursor = 'pointer';
          toast.success("Link adicionado ao botão!");
        } else {
          selectedElement.removeAttribute('onclick');
          toast.success("Link removido do botão!");
        }
      }
    }
  };

  const handleSavePage = async () => {
    setIsSaving(true);
    try {
      // Get current HTML from iframe
      const currentHtml = iframeRef.current?.contentWindow?.document.documentElement.outerHTML || html;
      const cleanHtml = currentHtml.replace(/<style[^>]*id="inline-edit-styles"[\s\S]*?<\/style>/g, '');
      await aiPagesService.update(pageId, {
        html_content: cleanHtml,
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

  const handleCancel = () => {
    setHtml(initialHtml);
    setIsEditMode(false);
    setSelectedElement(null);
    setShowTextEditor(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {!isEditMode ? (
          <Button
            onClick={() => setIsEditMode(true)}
            className="shadow-lg"
            size="sm"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar Página
          </Button>
        ) : (
          <>
            <Button
              onClick={handleSavePage}
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

      {/* Text Editor Popup */}
      {showTextEditor && selectedElement && (
        <div className="absolute top-20 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 w-80 max-h-[calc(100vh-10rem)] overflow-auto">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Editar Texto</label>
              <Input
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="mb-2"
              />
            </div>

            {(selectedElement.tagName === 'A' || selectedElement.tagName === 'BUTTON') && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {selectedElement.tagName === 'BUTTON' ? 'Adicionar Link ao Botão' : 'Link (URL)'}
                </label>
                <Input
                  value={currentLink}
                  onChange={(e) => setCurrentLink(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="mb-2"
                />
                <Button onClick={handleSaveLink} size="sm" className="w-full">
                  {selectedElement.tagName === 'BUTTON' ? 'Adicionar Link' : 'Salvar Link'}
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Cores
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Cor do Texto</label>
                      <input
                        type="color"
                        value={currentTextColor}
                        className="w-full h-10 rounded cursor-pointer"
                        onChange={(e) => handleChangeColor(e.target.value, 'color')}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Cor de Fundo</label>
                      <input
                        type="color"
                        value={currentBgColor}
                        className="w-full h-10 rounded cursor-pointer"
                        onChange={(e) => handleChangeColor(e.target.value, 'backgroundColor')}
                      />
                    </div>
                    <div className="border-t pt-3">
                      <label className="text-xs font-medium mb-2 block">Gradiente de Fundo</label>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Cor 1</label>
                          <input
                            type="color"
                            value={gradientColor1}
                            className="w-full h-8 rounded cursor-pointer"
                            onChange={(e) => setGradientColor1(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Cor 2</label>
                          <input
                            type="color"
                            value={gradientColor2}
                            className="w-full h-8 rounded cursor-pointer"
                            onChange={(e) => setGradientColor2(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Direção</label>
                          <select
                            value={gradientDirection}
                            onChange={(e) => setGradientDirection(e.target.value)}
                            className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                          >
                            <option value="to right">→ Horizontal</option>
                            <option value="to bottom">↓ Vertical</option>
                            <option value="to bottom right">↘ Diagonal</option>
                            <option value="135deg">↗ Diagonal Inversa</option>
                          </select>
                        </div>
                        <Button
                          onClick={handleApplyGradient}
                          size="sm"
                          className="w-full"
                        >
                          Aplicar Gradiente
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveText} size="sm" className="flex-1">
                Aplicar
              </Button>
              <Button
                onClick={() => {
                  setShowTextEditor(false);
                  setSelectedElement(null);
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute bottom-4 left-4 z-50 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm shadow-lg">
          Modo de Edição - Clique em qualquer elemento para editar
        </div>
      )}

      {/* Preview */}
      <iframe
        ref={iframeRef}
        srcDoc={html}
        className="w-full h-full border-0"
        title="Page Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}