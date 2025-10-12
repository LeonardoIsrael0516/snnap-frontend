import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Save, 
  X,
          padding: 2px !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }ponents/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Save, 
  X, 
  Pencil, 
  Palette,
  Link2,
  Type,
  Image,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { aiPagesService } from "@/lib/aiPages";

interface InlineVisualEditorProps {
  pageId: string;
  initialHtml: string;
  onSave?: () => void;
}

export function InlineVisualEditor({ pageId, initialHtml, onSave }: InlineVisualEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [html, setHtml] = useState(initialHtml);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [showElementEditor, setShowElementEditor] = useState(false);
  
  // Estados para edição do elemento
  const [editingText, setEditingText] = useState("");
  const [editingStyles, setEditingStyles] = useState({
    color: "#000000",
    backgroundColor: "transparent",
    fontSize: "16",
    padding: "0",
    margin: "0",
    borderRadius: "0",
    textAlign: "left",
    fontWeight: "normal",
    textDecoration: "none"
  });
  const [editingLink, setEditingLink] = useState("");
  const [editingLinkTarget, setEditingLinkTarget] = useState("_self");
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [editingImageSrc, setEditingImageSrc] = useState("");
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isEditModeRef = useRef(isEditMode);

  useEffect(() => {
    setHtml(initialHtml);
  }, [initialHtml]);

  // Configurar modo de edição no iframe
  useEffect(() => {
    isEditModeRef.current = isEditMode;
    
    if (isEditMode && iframeRef.current?.contentWindow) {
      const iframeDoc = iframeRef.current.contentWindow.document;
      
      // Remover estilos anteriores se existirem
      const existingStyle = iframeDoc.getElementById('inline-edit-styles');
      if (existingStyle) existingStyle.remove();
      
      // Adicionar estilos para o modo de edição
      const style = iframeDoc.createElement('style');
      style.id = 'inline-edit-styles';
      style.textContent = `
        * {
          position: relative !important;
        }
        
        .editable-element {
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        .editable-element:hover {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        .editable-element.selected {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
          background-color: rgba(59, 130, 246, 0.1) !important;
          position: relative !important;
        }
        
        .editable-element.selected::after {
          content: 'SELECIONADO - Clique em Editar' !important;
          position: absolute !important;
          top: -25px !important;
          left: 0 !important;
          background: #3b82f6 !important;
          color: white !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
          font-size: 10px !important;
          font-family: system-ui !important;
          z-index: 10000 !important;
          white-space: nowrap !important;
        }
        
        .edit-tooltip {
          position: absolute !important;
          top: -35px !important;
          left: 0 !important;
          background: #1f2937 !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
          font-family: system-ui !important;
          z-index: 10000 !important;
          white-space: nowrap !important;
          pointer-events: none !important;
        }
        
        .edit-controls {
          position: absolute !important;
          top: -40px !important;
          right: 0 !important;
          display: flex !important;
          gap: 4px !important;
          z-index: 10001 !important;
        }
        
        .edit-btn, .link-btn {
          background: #3b82f6 !important;
          color: white !important;
          border: none !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 11px !important;
          cursor: pointer !important;
          font-family: system-ui !important;
        }
        
        .edit-btn:hover, .link-btn:hover {
          background: #2563eb !important;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Tornar elementos editáveis
      const editableElements = iframeDoc.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, span, a, button, div, section, article, img, input, textarea'
      );
      
      editableElements.forEach((element) => {
        const el = element as HTMLElement;
        
        // Pular elementos que são containers muito grandes ou estruturais
        // Mas permitir links e botões independentemente do número de filhos
        if ((el.children.length > 3 && el.tagName !== 'A' && el.tagName !== 'BUTTON') || 
            el.tagName === 'HTML' || el.tagName === 'BODY' || el.tagName === 'HEAD') {
          return;
        }
        
        el.classList.add('editable-element');
        
        // Prevenir navegação de links durante edição (usando capture)
        if (el.tagName === 'A') {
          el.addEventListener('click', (e) => {
            if (isEditModeRef.current) {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          }, true); // Capture para interceptar antes de outros handlers
        }
        
        // Adicionar tooltip e controles no hover
        el.addEventListener('mouseenter', () => {
          if (!el.querySelector('.edit-tooltip')) {
            const tooltip = iframeDoc.createElement('div');
            tooltip.className = 'edit-tooltip';
            tooltip.textContent = `${el.tagName.toLowerCase()} - Passe o mouse para editar`;
            el.appendChild(tooltip);
          }
          
          // Adicionar controles no hover
          if (!el.querySelector('.edit-controls')) {
            const controls = iframeDoc.createElement('div');
            controls.className = 'edit-controls';
            
            // Botão Editar
            const editBtn = iframeDoc.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️ Editar';
            editBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Capturar dados do elemento ANTES de mostrar o modal
              const computedStyle = iframeDoc.defaultView?.getComputedStyle(el);
              if (computedStyle) {
                // Capturar texto limpo
                let textContent = '';
                if (el.tagName === 'IMG') {
                  textContent = (el as HTMLImageElement).alt || '';
                } else {
                  textContent = el.textContent || el.innerText || '';
                }
                
                setEditingText(textContent);
                console.log("Texto capturado (limpo):", textContent);
                
                setEditingStyles({
                  color: rgbToHex(computedStyle.color) || "#000000",
                  backgroundColor: computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'transparent' : rgbToHex(computedStyle.backgroundColor) || 'transparent',
                  fontSize: (parseInt(computedStyle.fontSize) || 16).toString(),
                  padding: computedStyle.padding || "0",
                  margin: computedStyle.margin || "0",
                  borderRadius: computedStyle.borderRadius || "0",
                  textAlign: computedStyle.textAlign || "left",
                  fontWeight: computedStyle.fontWeight || "normal",
                  textDecoration: computedStyle.textDecoration || "none"
                });
                
                // Capturar link se for âncora
                if (el.tagName === 'A') {
                  setEditingLink((el as HTMLAnchorElement).href || '');
                  setEditingLinkTarget((el as HTMLAnchorElement).target || '_self');
                } else if (el.tagName === 'IMG') {
                  setEditingImageSrc((el as HTMLImageElement).src || '');
                } else {
                  setEditingLink('');
                  setEditingLinkTarget('_self');
                  setEditingImageSrc('');
                }
              }
              
              setSelectedElement(el);
              setShowElementEditor(true);
            };
            
            // Botão Link
            const linkBtn = iframeDoc.createElement('button');
            linkBtn.className = 'link-btn';
            linkBtn.innerHTML = '🔗 Link';
            linkBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Capturar link atual se existir
              if (el.tagName === 'A') {
                setEditingLink((el as HTMLAnchorElement).href || '');
                setEditingLinkTarget((el as HTMLAnchorElement).target || '_self');
              } else {
                setEditingLink('');
                setEditingLinkTarget('_self');
              }
              
              setSelectedElement(el);
              setShowLinkEditor(true);
            };
            
            controls.appendChild(editBtn);
            controls.appendChild(linkBtn);
            el.appendChild(controls);
          }
        });
        
        el.addEventListener('mouseleave', () => {
          const tooltip = el.querySelector('.edit-tooltip');
          const editButton = el.querySelector('.edit-element-btn');
          const editControls = el.querySelector('.edit-controls');
          if (tooltip) tooltip.remove();
          if (editButton) editButton.remove();
          if (editControls) editControls.remove();
        });
      });
    }
  }, [isEditMode]);

  // Converter RGB para HEX
  const rgbToHex = (rgb: string) => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
    
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      const hex = (x: string) => ("0" + parseInt(x).toString(16)).slice(-2);
      return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
    }
    return rgb;
  };

  // Aplicar mudanças no elemento
  const applyElementChanges = () => {
    if (!selectedElement || !iframeRef.current?.contentWindow) {
      toast.error("Nenhum elemento selecionado");
      return;
    }
    
    console.log("Aplicando mudanças no elemento:", selectedElement.tagName, editingText);
    
    // Aplicar texto
    if (selectedElement.tagName === 'IMG') {
      (selectedElement as HTMLImageElement).src = editingImageSrc;
      (selectedElement as HTMLImageElement).alt = editingText;
    } else {
      // Para elementos de texto, preservar estrutura HTML interna se existir
      if (selectedElement.children.length === 0) {
        selectedElement.textContent = editingText;
      } else {
        // Se tem filhos, tentar atualizar apenas o texto
        const textNodes = Array.from(selectedElement.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        if (textNodes.length > 0) {
          textNodes[0].textContent = editingText;
        } else {
          selectedElement.textContent = editingText;
        }
      }
    }
    
    // Aplicar link
    if (selectedElement.tagName === 'A' && editingLink) {
      (selectedElement as HTMLAnchorElement).href = editingLink;
      (selectedElement as HTMLAnchorElement).target = editingLinkTarget;
    }
    
    // Aplicar estilos inline (sobrescreve CSS existente)
    Object.entries(editingStyles).forEach(([key, value]) => {
      if (value && value !== 'transparent' && value !== '') {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        
        if (key === 'fontSize') {
          selectedElement.style.setProperty(cssKey, `${value}px`, 'important');
        } else if (key === 'backgroundColor' && value === 'transparent') {
          selectedElement.style.removeProperty(cssKey);
        } else {
          selectedElement.style.setProperty(cssKey, value.toString(), 'important');
        }
      }
    });
    
    // Forçar refresh visual
    selectedElement.style.display = 'none';
    selectedElement.offsetHeight; // Trigger reflow
    selectedElement.style.display = '';
    
    // NÃO atualizar HTML imediatamente para preservar event listeners
    // O HTML será atualizado apenas no momento do save
    console.log("Mudanças aplicadas ao elemento, event listeners preservados");
    
    // Manter o elemento selecionado para permitir edições subsequentes
    selectedElement.classList.add('selected');
    
    setShowElementEditor(false);
    toast.success(`${selectedElement.tagName.toLowerCase()} atualizado!`);
  };

  // Aplicar link
  const applyLinkChanges = () => {
    if (!selectedElement || !iframeRef.current?.contentWindow) {
      toast.error("Nenhum elemento selecionado");
      return;
    }

    console.log("Aplicando link ao elemento:", selectedElement.tagName, editingLink);

    if (editingLink) {
      if (selectedElement.tagName === 'A') {
        // Se já é uma âncora, apenas atualizar
        (selectedElement as HTMLAnchorElement).href = editingLink;
        (selectedElement as HTMLAnchorElement).target = editingLinkTarget;
      } else {
        // Se não é âncora, envolver em uma âncora
        const iframeDoc = iframeRef.current.contentDocument!;
        const link = iframeDoc.createElement('a');
        link.href = editingLink;
        link.target = editingLinkTarget;
        
        // Mover o conteúdo para dentro do link
        const parent = selectedElement.parentNode;
        if (parent) {
          parent.insertBefore(link, selectedElement);
          link.appendChild(selectedElement);
          setSelectedElement(link);
        }
      }
    } else {
      // Remover link se estiver vazio
      if (selectedElement.tagName === 'A') {
        const parent = selectedElement.parentNode;
        if (parent) {
          // Mover filhos para fora da âncora
          while (selectedElement.firstChild) {
            parent.insertBefore(selectedElement.firstChild, selectedElement);
          }
          parent.removeChild(selectedElement);
        }
      }
    }

    setShowLinkEditor(false);
    toast.success("Link atualizado!");
  };

  // Salvar página
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Pegar HTML atual do iframe, mas limpar estilos de edição
      let finalHtml = html;
      
      if (iframeRef.current?.contentWindow) {
        const doc = iframeRef.current.contentWindow.document;
        
        // Remover classes e elementos de edição
        const editableElements = doc.querySelectorAll('.editable-element');
        editableElements.forEach(el => {
          el.classList.remove('editable-element', 'selected');
          const tooltip = el.querySelector('.edit-tooltip');
          const controls = el.querySelector('.edit-controls');
          if (tooltip) tooltip.remove();
          if (controls) controls.remove();
        });
        
        // Remover estilos de edição
        const editStyles = doc.getElementById('inline-edit-styles');
        if (editStyles) editStyles.remove();
        
        finalHtml = doc.documentElement.outerHTML;
      }
      
      await aiPagesService.update(pageId, {
        html_content: finalHtml,
      });
      
      setHtml(finalHtml);
      toast.success("Página salva com sucesso!");
      setIsEditMode(false);
      setSelectedElement(null);
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
    setHtml(initialHtml);
    setIsEditMode(false);
    setSelectedElement(null);
    setShowElementEditor(false);
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
            Editar Inline
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

      {/* Iframe com a página */}
      <iframe
        ref={iframeRef}
        srcDoc={html}
        className="w-full h-full border-0"
        title="Page Preview"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Modal de Edição de Elemento */}
      <Dialog open={showElementEditor} onOpenChange={setShowElementEditor}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Editar Elemento
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Conteúdo/Texto */}
            <div>
              <Label className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                {selectedElement?.tagName === 'IMG' ? 'Texto Alternativo' : 'Conteúdo'}
              </Label>
              {selectedElement?.tagName === 'IMG' ? (
                <Input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="Texto alternativo da imagem"
                />
              ) : (
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="Digite o texto do elemento"
                  rows={3}
                />
              )}
            </div>

            {/* URL da Imagem */}
            {selectedElement?.tagName === 'IMG' && (
              <div>
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  URL da Imagem
                </Label>
                <Input
                  value={editingImageSrc}
                  onChange={(e) => setEditingImageSrc(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            )}

            {/* Link (para elementos com href) */}
            {selectedElement?.tagName === 'A' && (
              <div>
                <Label className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Link (URL)
                </Label>
                <Input
                  value={editingLink}
                  onChange={(e) => setEditingLink(e.target.value)}
                  placeholder="https://exemplo.com"
                />
              </div>
            )}

            {/* Estilos */}
            <div className="border-t pt-4">
              <Label className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" />
                Aparência
              </Label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Cor do Texto */}
                <div>
                  <Label className="text-xs">Cor do Texto</Label>
                  <Input
                    type="color"
                    value={editingStyles.color}
                    onChange={(e) => setEditingStyles(prev => ({...prev, color: e.target.value}))}
                    className="h-10"
                  />
                </div>

                {/* Cor de Fundo */}
                <div>
                  <Label className="text-xs">Cor de Fundo</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={editingStyles.backgroundColor === 'transparent' ? '#ffffff' : editingStyles.backgroundColor}
                      onChange={(e) => setEditingStyles(prev => ({...prev, backgroundColor: e.target.value}))}
                      className="h-10 flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingStyles(prev => ({...prev, backgroundColor: 'transparent'}))}
                      className="px-2"
                    >
                      🚫
                    </Button>
                  </div>
                </div>

                {/* Tamanho da Fonte */}
                <div>
                  <Label className="text-xs">Tamanho (px)</Label>
                  <Input
                    type="number"
                    value={editingStyles.fontSize}
                    onChange={(e) => setEditingStyles(prev => ({...prev, fontSize: e.target.value}))}
                    min="8"
                    max="100"
                  />
                </div>

                {/* Alinhamento */}
                <div>
                  <Label className="text-xs text-foreground">Alinhamento</Label>
                  <select
                    value={editingStyles.textAlign}
                    onChange={(e) => setEditingStyles(prev => ({...prev, textAlign: e.target.value}))}
                    className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
                  >
                    <option value="left" className="bg-background text-foreground">Esquerda</option>
                    <option value="center" className="bg-background text-foreground">Centro</option>
                    <option value="right" className="bg-background text-foreground">Direita</option>
                    <option value="justify" className="bg-background text-foreground">Justificado</option>
                  </select>
                </div>

                {/* Peso da Fonte */}
                <div>
                  <Label className="text-xs text-foreground">Peso da Fonte</Label>
                  <select
                    value={editingStyles.fontWeight}
                    onChange={(e) => setEditingStyles(prev => ({...prev, fontWeight: e.target.value}))}
                    className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
                  >
                    <option value="normal" className="bg-background text-foreground">Normal</option>
                    <option value="bold" className="bg-background text-foreground">Negrito</option>
                    <option value="lighter" className="bg-background text-foreground">Mais Leve</option>
                    <option value="bolder" className="bg-background text-foreground">Mais Pesado</option>
                  </select>
                </div>

                {/* Borda Arredondada */}
                <div>
                  <Label className="text-xs">Borda Arredondada (px)</Label>
                  <Input
                    type="number"
                    value={editingStyles.borderRadius?.replace('px', '') || '0'}
                    onChange={(e) => setEditingStyles(prev => ({...prev, borderRadius: e.target.value + 'px'}))}
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              {/* Espaçamento */}
              <div className="mt-3">
                <Label className="text-xs">Espaçamento Interno (padding)</Label>
                <Input
                  value={editingStyles.padding}
                  onChange={(e) => setEditingStyles(prev => ({...prev, padding: e.target.value}))}
                  placeholder="10px ou 10px 20px"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowElementEditor(false)}
              >
                Cancelar
              </Button>
              <Button onClick={applyElementChanges}>
                Aplicar Mudanças
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Link */}
      <Dialog open={showLinkEditor} onOpenChange={setShowLinkEditor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🔗 Editar Link</DialogTitle>
            <DialogDescription>
              Configure o link para este elemento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-foreground">URL do Link</Label>
              <Input
                type="url"
                placeholder="https://exemplo.com"
                value={editingLink}
                onChange={(e) => setEditingLink(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="text-xs text-foreground">Abrir Link</Label>
              <select
                value={editingLinkTarget}
                onChange={(e) => setEditingLinkTarget(e.target.value)}
                className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="_self" className="bg-background text-foreground">Na mesma aba</option>
                <option value="_blank" className="bg-background text-foreground">Em nova aba</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLinkEditor(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={applyLinkChanges}
            >
              Aplicar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Indicador de Modo de Edição */}
      {isEditMode && (
        <div className="absolute bottom-4 left-4 z-50 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm shadow-lg">
          ✏️ Modo Edição Inline - Clique nos elementos para editar
        </div>
      )}
    </div>
  );
}