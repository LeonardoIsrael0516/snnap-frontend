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
  Pencil, 
  Palette,
  Link2,
  Type,
  Image,
  Settings,
  Upload,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { aiPagesService } from "@/lib/aiPages";
import ImageUpload from "./ImageUpload";
import { PWASettings } from "./PWASettings";

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
  const [showPWASettings, setShowPWASettings] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  
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
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [editingImageSrc, setEditingImageSrc] = useState("");
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isEditModeRef = useRef(isEditMode);

  // Função para extrair apenas o texto original do elemento, sem controles de edição
  const getOriginalText = (element: HTMLElement): string => {
    // Criar uma cópia do elemento para não afetar o original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Remover todos os elementos de controle de edição
    const tooltips = clone.querySelectorAll('.edit-tooltip');
    const controls = clone.querySelectorAll('.edit-controls');
    const editBtns = clone.querySelectorAll('.edit-btn');
    const linkBtns = clone.querySelectorAll('.link-btn');
    
    tooltips.forEach(tooltip => tooltip.remove());
    controls.forEach(control => control.remove());
    editBtns.forEach(btn => btn.remove());
    linkBtns.forEach(btn => btn.remove());
    
    // Se o elemento tem filhos, tentar pegar apenas o texto direto
    if (clone.children.length === 0) {
      // Elemento sem filhos - texto direto
      return clone.textContent?.trim() || '';
    } else {
      // Elemento com filhos - pegar apenas os nós de texto diretos
      let textContent = '';
      clone.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          textContent += node.textContent || '';
        }
      });
      
      // Se não encontrou texto direto, pegar o texto de elementos filhos (exceto controles)
      if (textContent.trim().length === 0) {
        return clone.textContent?.trim() || '';
      }
      
      return textContent.trim();
    }
  };

  // Função para processar o HTML e garantir funcionamento completo
  const processHtmlForIframe = (rawHtml: string) => {
    // Se o HTML já tem estrutura completa, usar como está
    if (rawHtml.includes('<!DOCTYPE html>') && rawHtml.includes('<html')) {
      // Adicionar Tailwind CSS se ainda não existe
      if (!rawHtml.includes('tailwindcss.com')) {
        rawHtml = rawHtml.replace(
          '<head>',
          '<head>\n  <script src="https://cdn.tailwindcss.com"></script>'
        );
      }
      
      // Adicionar script para interceptar links se ainda não existe
      if (!rawHtml.includes('// Link interceptor script for editor')) {
        const linkScript = `
<script>
// Link interceptor script for editor
document.addEventListener('DOMContentLoaded', function() {
  // Interceptar todos os cliques em links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      // Se o link está selecionado para edição, não fazer nada (já foi bloqueado)
      if (link.classList.contains('selected')) {
        return;
      }
      
      e.preventDefault();
      
      // Verificar se deve abrir em nova aba
      const shouldOpenNewTab = link.target === '_blank' || 
                              e.ctrlKey || 
                              e.metaKey || 
                              e.button === 1; // Middle click
      
      if (shouldOpenNewTab) {
        window.open(link.href, '_blank');
      } else {
        // No editor, navegar na janela principal
        if (window.parent && window.parent !== window) {
          window.parent.location.href = link.href;
        } else {
          window.location.href = link.href;
        }
      }
    }
  });
});
</script>`;
        
        // Inserir o script antes do </body>
        return rawHtml.replace('</body>', linkScript + '\n</body>');
      }
      return rawHtml;
    }

    // Caso contrário, envolver em estrutura HTML completa
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Editor Visual</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  ${rawHtml}
  
<script>
// Link interceptor script for editor
document.addEventListener('DOMContentLoaded', function() {
  // Interceptar todos os cliques em links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      // Se o link está selecionado para edição, não fazer nada (já foi bloqueado)
      if (link.classList.contains('selected')) {
        return;
      }
      
      e.preventDefault();
      
      // Verificar se deve abrir em nova aba
      const shouldOpenNewTab = link.target === '_blank' || 
                              e.ctrlKey || 
                              e.metaKey || 
                              e.button === 1; // Middle click
      
      if (shouldOpenNewTab) {
        window.open(link.href, '_blank');
      } else {
        // No editor, navegar na janela principal
        if (window.parent && window.parent !== window) {
          window.parent.location.href = link.href;
        } else {
          window.location.href = link.href;
        }
      }
    }
  });
});
</script>
</body>
</html>`;
  };

  // Atualizar HTML inicial
  useEffect(() => {
    setHtml(initialHtml);
  }, [initialHtml]);

  // Carregar dados da página
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const data = await aiPagesService.getById(pageId);
        setPageData(data);
      } catch (error) {
        console.error('Erro ao carregar dados da página:', error);
      }
    };
    
    if (pageId) {
      loadPageData();
    }
  }, [pageId]);

  // Atualizar configurações PWA
  const handlePWAUpdate = async (updates: any) => {
    console.log('🔄 InlineVisualEditor: handlePWAUpdate chamado com:', updates);
    console.log('🔄 InlineVisualEditor: pwaShowInstallPrompt:', updates.pwaShowInstallPrompt, 'tipo:', typeof updates.pwaShowInstallPrompt);
    
    try {
      await aiPagesService.update(pageId, updates);
      setPageData(prev => ({ ...prev, ...updates }));
      toast.success('Configurações PWA atualizadas!');
    } catch (error) {
      console.error('❌ InlineVisualEditor: Erro ao atualizar PWA:', error);
      toast.error('Erro ao atualizar configurações PWA');
      throw error;
    }
  };

  // Configurar modo de edição no iframe
  useEffect(() => {
    isEditModeRef.current = isEditMode;
    
    if (isEditMode && iframeRef.current?.contentWindow) {
      const iframeDoc = iframeRef.current.contentWindow.document;
      
      // Remover estilos anteriores se existirem
      const existingStyle = iframeDoc.getElementById('inline-edit-styles');
      if (existingStyle) existingStyle.remove();

      // Adicionar estilos para edição
      const style = iframeDoc.createElement('style');
      style.id = 'inline-edit-styles';
      style.textContent = `
        .editable-element {
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        .editable-element:hover {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          background-color: rgba(59, 130, 246, 0.08) !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        .editable-element.selected {
          outline: 3px solid #10b981 !important;
          outline-offset: 2px !important;
          background-color: rgba(16, 185, 129, 0.12) !important;
          position: relative !important;
        }
        
        .editable-element.selected::after {
          content: '✏️ SELECIONADO - Edite este elemento' !important;
          position: absolute !important;
          top: -28px !important;
          left: 0 !important;
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 5px !important;
          font-size: 11px !important;
          font-family: system-ui !important;
          z-index: 10000 !important;
          white-space: nowrap !important;
          font-weight: 500 !important;
          text-shadow: 0 1px 1px rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        
        .edit-tooltip {
          position: absolute !important;
          top: -32px !important;
          left: 0 !important;
          background: rgba(0, 0, 0, 0.9) !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 5px !important;
          font-size: 11px !important;
          z-index: 9999 !important;
          white-space: nowrap !important;
          font-family: system-ui !important;
          backdrop-filter: blur(4px) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          font-weight: 500 !important;
        }
        
        .edit-controls {
          position: absolute !important;
          top: -55px !important;
          right: 0 !important;
          display: flex !important;
          gap: 6px !important;
          z-index: 10001 !important;
          background: rgba(255, 255, 255, 0.95) !important;
          padding: 8px !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          backdrop-filter: blur(8px) !important;
        }
        
        .edit-btn, .link-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          color: white !important;
          border: none !important;
          padding: 8px 12px !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          cursor: pointer !important;
          font-family: system-ui !important;
          transition: all 0.2s ease !important;
          font-weight: 500 !important;
          text-shadow: 0 1px 1px rgba(0,0,0,0.2) !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
        }
        
        .edit-btn:hover, .link-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4) !important;
        }
        
        .edit-controls:hover {
          opacity: 1 !important;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Tornar elementos editáveis - buscar TODOS os elementos
      const editableElements = iframeDoc.querySelectorAll('*');
      
      editableElements.forEach((element) => {
        const el = element as HTMLElement;
        
        // Obter informações sobre o elemento
        const textContent = el.textContent?.trim() || '';
        const hasText = textContent.length > 0;
        const childrenCount = el.children.length;
        const hasChildren = childrenCount > 0;
        const tagName = el.tagName.toLowerCase();
        
        // Elementos que NUNCA devem ser editáveis
        const neverEditable = ['html', 'body', 'head', 'script', 'style', 'meta', 'link', 'title', 'br', 'hr'];
        if (neverEditable.includes(tagName)) {
          return;
        }
        
        // Elementos que SÃO SEMPRE editáveis
        const alwaysEditable = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'img', 'input', 'textarea', 'span', 'strong', 'em', 'b', 'i', 'u', 'small', 'code', 'label', 'li', 'td', 'th', 'figcaption', 'blockquote', 'cite', 'pre', 'mark', 'ins', 'del', 'sub', 'sup', 'time', 'address'];
        
        // Verificações especiais para texto e classes relevantes
        const hasSignificantText = hasText && textContent.length >= 2 && textContent.length <= 500;
        const hasRelevantClasses = el.className.toString().match(/(text|title|content|card|item|block|description|summary|intro|caption|name|label|heading|subtitle|quote|author|date|price|value|count|number)/i);
        
        // Critérios mais inclusivos para DIVs e SPANs
        const isContentDiv = tagName === 'div' && (
          (hasText && childrenCount <= 4) || // DIV com texto e poucos filhos
          hasRelevantClasses || // Classes indicativas de conteúdo
          (hasSignificantText && childrenCount === 0) // DIV só com texto
        );
        
        const isContentSpan = tagName === 'span' && hasSignificantText;
        
        // Verificações para containers semânticos
        const isSemanticContainer = ['section', 'article', 'header', 'footer', 'main', 'aside', 'nav'].includes(tagName) && (
          (hasText && childrenCount <= 6) ||
          hasRelevantClasses
        );
        
        // Decidir se o elemento deve ser editável
        const shouldBeEditable = alwaysEditable.includes(tagName) || 
                                isContentDiv || 
                                isContentSpan ||
                                isSemanticContainer ||
                                (hasSignificantText && childrenCount === 0); // Qualquer elemento só com texto
        
        if (!shouldBeEditable) {
          return;
        }
        
        // Adicionar classe e funcionalidades de edição
        el.classList.add('editable-element');
        
        // Log com texto limpo
        const cleanText = getOriginalText(el);
        console.log(`✏️ Elemento editável: ${tagName}${el.className ? '.' + el.className.toString().split(' ')[0] : ''} - "${cleanText.substring(0, 30)}..."`);
        
        // Log especial para imagens
        if (tagName === 'img') {
          console.log(`🖼️ IMAGEM DETECTADA COMO EDITÁVEL:`, el);
          console.log(`🖼️ SRC:`, (el as HTMLImageElement).src);
          console.log(`🖼️ ALT:`, (el as HTMLImageElement).alt);
        }
        
        // Controle inteligente de navegação de links
        if (el.tagName === 'A') {
          el.addEventListener('click', (e) => {
            // Se o link está selecionado para edição, bloquear navegação
            if (el.classList.contains('selected')) {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔗 Navegação bloqueada - elemento em edição');
              return;
            }
            
            // Se não está selecionado, permitir navegação normal
            // O script interceptor cuidará da navegação correta
            console.log('🔗 Permitindo navegação do link');
          });
        }

        let hoverTimeout: NodeJS.Timeout;
        
        // APENAS TOOLTIP NO HOVER - controles aparecem no CLIQUE
        el.addEventListener('mouseenter', () => {
          clearTimeout(hoverTimeout);
          el.classList.add('hovered');
          
          if (!el.querySelector('.edit-tooltip')) {
            const tooltip = iframeDoc.createElement('div');
            tooltip.className = 'edit-tooltip';
            
            // Tooltip informativo
            let tooltipText = '';
            const tagName = el.tagName.toLowerCase();
            
            if (tagName === 'img') {
              tooltipText = '🖼️ Imagem - Clique para editar';
            } else if (tagName === 'a') {
              tooltipText = '🔗 Link - Clique para editar';
            } else if (tagName === 'button') {
              tooltipText = '🔘 Botão - Clique para editar';
            } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              tooltipText = '📝 Título - Clique para editar';
            } else if (tagName === 'p') {
              tooltipText = '📄 Parágrafo - Clique para editar';
            } else {
              tooltipText = `✏️ ${tagName} - Clique para editar`;
            }
            
            tooltip.textContent = tooltipText;
            el.appendChild(tooltip);
          }
        });

        el.addEventListener('mouseleave', () => {
          el.classList.remove('hovered');
          hoverTimeout = setTimeout(() => {
            const tooltip = el.querySelector('.edit-tooltip');
            if (tooltip) tooltip.remove();
            
            // Só remover controles se não estiver selecionado
            if (!el.classList.contains('selected')) {
              const editControls = el.querySelector('.edit-controls');
              if (editControls) editControls.remove();
            }
          }, 200);
        });

        // CLIQUE para selecionar e mostrar controles
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('🖱️ Clique detectado em:', el.tagName, el.className);
          
          // Log especial para imagens
          if (el.tagName === 'IMG') {
            console.log('🖼️ CLIQUE EM IMAGEM DETECTADO!');
            console.log('🖼️ Elemento:', el);
            console.log('🖼️ SRC:', (el as HTMLImageElement).src);
          }
          
          // Remover seleção anterior
          const previousSelected = iframeDoc.querySelector('.editable-element.selected');
          if (previousSelected && previousSelected !== el) {
            previousSelected.classList.remove('selected');
            const prevControls = previousSelected.querySelector('.edit-controls');
            if (prevControls) prevControls.remove();
          }
          
          // Toggle seleção do elemento atual
          const isCurrentlySelected = el.classList.contains('selected');
          
          if (isCurrentlySelected) {
            // Se já está selecionado, remover seleção
            el.classList.remove('selected');
            const controls = el.querySelector('.edit-controls');
            if (controls) controls.remove();
            console.log('❌ Seleção removida');
          } else {
            // Selecionar elemento
            el.classList.add('selected');
            console.log('✅ Elemento selecionado:', el.tagName);
            
            // Adicionar controles
            const controls = iframeDoc.createElement('div');
            controls.className = 'edit-controls';
            console.log('🎛️ Criando controles para:', el.tagName);
            
            // Botão Editar
            const editBtn = iframeDoc.createElement('button');
            editBtn.className = 'edit-btn';
            const tagName = el.tagName.toLowerCase();
            
            if (tagName === 'img') {
              editBtn.innerHTML = '🖼️ Editar';
              console.log('🖼️ Botão de edição de imagem criado');
            } else if (tagName === 'a') {
              editBtn.innerHTML = '🔗 Editar';
            } else if (tagName === 'button') {
              editBtn.innerHTML = '🔘 Editar';
            } else {
              editBtn.innerHTML = '✏️ Editar';
            }
            
            editBtn.onclick = (btnEvent) => {
              btnEvent.preventDefault();
              btnEvent.stopPropagation();
              
              // Capturar dados do elemento
              const computedStyle = iframeDoc.defaultView?.getComputedStyle(el);
              if (computedStyle) {
                let textContent = '';
                if (el.tagName === 'IMG') {
                  textContent = (el as HTMLImageElement).alt || '';
                } else {
                  // Usar função para extrair texto limpo
                  textContent = getOriginalText(el);
                }
                
                setEditingText(textContent);
                
                // Verificar se o fundo é transparente - melhor detecção
                const bgColor = computedStyle.backgroundColor;
                const isTransparent = !bgColor || 
                                     bgColor === 'transparent' || 
                                     bgColor === 'rgba(0, 0, 0, 0)' ||
                                     bgColor === 'initial' ||
                                     bgColor === 'inherit';
                
                setEditingStyles({
                  color: rgbToHex(computedStyle.color) || "#000000",
                  backgroundColor: isTransparent ? 'transparent' : (rgbToHex(bgColor) || 'transparent'),
                  fontSize: (parseInt(computedStyle.fontSize) || 16).toString(),
                  padding: computedStyle.padding || "0",
                  margin: computedStyle.margin || "0",
                  borderRadius: computedStyle.borderRadius || "0",
                  textAlign: computedStyle.textAlign || "left",
                  fontWeight: computedStyle.fontWeight || "normal",
                  textDecoration: computedStyle.textDecoration || "none"
                });
                
                if (el.tagName === 'A') {
                  setEditingLink((el as HTMLAnchorElement).href || '');
                } else if (el.tagName === 'IMG') {
                  setEditingImageSrc((el as HTMLImageElement).src || '');
                } else {
                  setEditingLink('');
                  setEditingImageSrc('');
                }
              }
              
              setSelectedElement(el);
              setShowElementEditor(true);
            };
            
            controls.appendChild(editBtn);
            
            // Botão Link (apenas se relevante)
            if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'IMG') {
              const linkBtn = iframeDoc.createElement('button');
              linkBtn.className = 'link-btn';
              
              if (el.tagName === 'A') {
                linkBtn.innerHTML = '🔗 Link';
              } else if (el.tagName === 'BUTTON') {
                linkBtn.innerHTML = '🔗 Ação';
              } else if (el.tagName === 'IMG') {
                linkBtn.innerHTML = '🔗 Link';
              }
              
              linkBtn.onclick = (btnEvent) => {
                btnEvent.preventDefault();
                btnEvent.stopPropagation();
                
                if (el.tagName === 'A') {
                  setEditingLink((el as HTMLAnchorElement).href || '');
                } else {
                  setEditingLink('');
                }
                
                setSelectedElement(el);
                setShowLinkEditor(true);
              };
              
              controls.appendChild(linkBtn);
            }
            
            el.appendChild(controls);
            console.log('🎛️ Controles anexados ao elemento:', el.tagName);
            console.log('🎛️ HTML dos controles:', controls.outerHTML);
          }
        });
      });
      
      // Adicionar detector de clique para elementos não editáveis
      iframeDoc.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        // Se clicou em um elemento que não é editável mas tem texto
        if (!target.classList.contains('editable-element')) {
          // Usar função para extrair texto limpo
          const cleanText = getOriginalText(target);
          const hasText = cleanText.length > 0;
          const isInteractive = ['a', 'button', 'input', 'textarea'].includes(target.tagName.toLowerCase());
          
          // Se tem texto significativo ou é interativo, tornar editável
          if ((hasText && cleanText.length > 2) || isInteractive) {
            console.log(`🎯 Elemento detectado por clique: ${target.tagName} - "${cleanText.substring(0, 50)}..."`);
            
            // Adicionar funcionalidade de edição dinamicamente
            target.classList.add('editable-element');
            
            // Adicionar tooltip hover
            const addHoverEvents = () => {
              target.addEventListener('mouseenter', () => {
                target.classList.add('hovered');
                
                if (!target.querySelector('.edit-tooltip')) {
                  const tooltip = iframeDoc.createElement('div');
                  tooltip.className = 'edit-tooltip';
                  tooltip.textContent = `✏️ ${target.tagName.toLowerCase()} - Clique para editar`;
                  target.appendChild(tooltip);
                }
              });
              
              target.addEventListener('mouseleave', () => {
                target.classList.remove('hovered');
                setTimeout(() => {
                  const tooltip = target.querySelector('.edit-tooltip');
                  if (tooltip && !target.classList.contains('selected')) {
                    tooltip.remove();
                  }
                }, 200);
              });
            };
            
            addHoverEvents();
          }
        }
      });
    } else if (iframeRef.current?.contentWindow) {
      // Quando sair do modo de edição, remover estilos e limpar elementos de edição
      const iframeDoc = iframeRef.current.contentWindow.document;
      
      // Remover estilos de edição
      const editStyles = iframeDoc.getElementById('inline-edit-styles');
      if (editStyles) editStyles.remove();
      
      // Remover classes de edição e elementos de controle
      const editableElements = iframeDoc.querySelectorAll('.editable-element');
      editableElements.forEach(el => {
        el.classList.remove('editable-element', 'selected', 'hovered');
        const tooltip = el.querySelector('.edit-tooltip');
        const controls = el.querySelector('.edit-controls');
        if (tooltip) tooltip.remove();
        if (controls) controls.remove();
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
    }
    
    // Aplicar estilos
    Object.entries(editingStyles).forEach(([property, value]) => {
      if (value) {
        if (property === 'fontSize') {
          selectedElement.style[property as any] = value + 'px';
        } else if (property === 'borderRadius') {
          // Aplicar borderRadius mesmo se for 0
          selectedElement.style[property as any] = value.includes('px') ? value : value + 'px';
        } else if (property === 'backgroundColor' && value === 'transparent') {
          // Remover background para tornar transparente
          selectedElement.style.backgroundColor = '';
          selectedElement.style.background = '';
        } else {
          selectedElement.style[property as any] = value;
        }
      }
    });
    
    // Forçar reflow visual de forma mais suave
    const originalDisplay = selectedElement.style.display;
    selectedElement.style.visibility = 'hidden';
    selectedElement.offsetHeight; // trigger reflow
    selectedElement.style.visibility = 'visible';
    if (originalDisplay) {
      selectedElement.style.display = originalDisplay;
    }
    
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
        
        console.log("Link atualizado:", {
          href: (selectedElement as HTMLAnchorElement).href
        });
      } else {
        // Se não é âncora, preservar estrutura criando âncora wrapper
        const iframeDoc = iframeRef.current.contentDocument!;
        const link = iframeDoc.createElement('a');
        link.href = editingLink;
        
        // Preservar estilos do elemento original
        const computedStyle = iframeDoc.defaultView!.getComputedStyle(selectedElement);
        const originalPosition = computedStyle.position;
        const originalDisplay = computedStyle.display;
        const originalMargin = computedStyle.margin;
        const originalFloat = computedStyle.float;
        
        console.log("Criando link wrapper preservando estilos:", {
          href: link.href,
          originalPosition,
          originalDisplay,
          originalMargin,
          originalFloat
        });
        
        // Aplicar estilos ao link para preservar layout
        link.style.display = originalDisplay === 'inline' ? 'inline' : originalDisplay;
        if (originalPosition !== 'static') {
          link.style.position = originalPosition;
        }
        if (originalMargin !== '0px') {
          link.style.margin = originalMargin;
          // Remover margin do elemento filho para evitar duplicação
          selectedElement.style.margin = '0';
        }
        if (originalFloat !== 'none') {
          link.style.float = originalFloat;
        }
        
        // Mover o elemento para dentro do link preservando estrutura
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
        const iframeDoc = iframeRef.current.contentWindow.document;
        
        // Limpar elementos de edição MAIS RIGOROSAMENTE
        const editTooltips = iframeDoc.querySelectorAll('.edit-tooltip');
        const editControls = iframeDoc.querySelectorAll('.edit-controls');
        const editButtons = iframeDoc.querySelectorAll('.edit-element-btn, .edit-btn, .link-btn');
        const editStyles = iframeDoc.getElementById('inline-edit-styles');
        
        editTooltips.forEach(el => el.remove());
        editControls.forEach(el => el.remove());
        editButtons.forEach(el => el.remove());
        if (editStyles) editStyles.remove();
        
        // Remover classes de edição e limpar atributos relacionados
        const editableElements = iframeDoc.querySelectorAll('.editable-element, .selected, .hovered');
        editableElements.forEach(el => {
          el.classList.remove('editable-element', 'selected', 'hovered');
          
          // Remover event listeners inline se existirem
          el.removeAttribute('onclick');
          el.removeAttribute('onmouseenter');
          el.removeAttribute('onmouseleave');
          
          // Para links, verificar se tem os atributos corretos
          if (el.tagName === 'A') {
            const link = el as HTMLAnchorElement;
            console.log('Link no HTML final:', {
              href: link.href,
              target: link.target,
              rel: link.rel,
              outerHTML: link.outerHTML
            });
          }
        });
        
        // Remover quaisquer scripts de debug/teste que possam ter sido adicionados
        const debugScripts = iframeDoc.querySelectorAll('script');
        debugScripts.forEach(script => {
          if (script.textContent?.includes('testLinks') || 
              script.textContent?.includes('debug') ||
              script.textContent?.includes('editable-element')) {
            script.remove();
          }
        });
        
        finalHtml = iframeDoc.documentElement.outerHTML;
        
        // Limpeza adicional via regex para remover qualquer resíduo
        finalHtml = finalHtml
          .replace(/class="[^"]*editable-element[^"]*"/g, '') // Remove classes de edição
          .replace(/class="[^"]*selected[^"]*"/g, '') 
          .replace(/class="[^"]*hovered[^"]*"/g, '')
          .replace(/class=""\s*/g, '') // Remove atributos class vazios
          .replace(/\s+class=""/g, '') // Remove class="" isolados
          .replace(/<div[^>]*edit-tooltip[^>]*>.*?<\/div>/gs, '') // Remove tooltips residuais
          .replace(/<div[^>]*edit-controls[^>]*>.*?<\/div>/gs, ''); // Remove controles residuais
        
        console.log("💾 HTML limpo para salvar (sem elementos de edição):", {
          originalLength: iframeDoc.documentElement.outerHTML.length,
          cleanedLength: finalHtml.length,
          hasEditableClass: finalHtml.includes('editable-element'),
          hasEditControls: finalHtml.includes('edit-controls')
        });
        
        setHtml(finalHtml);
      }
      
      await aiPagesService.update(pageId, { html_content: finalHtml });
      toast.success("Página salva com sucesso!");
      
      // Log para debug - verificar se HTML foi salvo corretamente
      console.log('HTML salvo sem elementos de edição:', finalHtml.includes('editable-element') ? 'ERRO: Ainda tem elementos de edição!' : 'OK: HTML limpo');
      
      onSave?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar a página");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    console.log("🔄 Cancelando edição e restaurando HTML original");
    setIsEditMode(false);
    setSelectedElement(null);
    setShowElementEditor(false);
    setShowLinkEditor(false);
    
    // Restaurar HTML original
    setHtml(initialHtml);
    
    // Forçar re-render do iframe com HTML original
    if (iframeRef.current) {
      iframeRef.current.srcdoc = initialHtml;
    }
    
    toast.info("Edição cancelada. Página restaurada ao estado original.");
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Barra de ferramentas */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            size="sm"
          >
            <Pencil className="w-4 h-4 mr-1" />
            {isEditMode ? "Sair da Edição" : "Editar Página"}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Iframe para visualização/edição */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          srcDoc={processHtmlForIframe(html)}
          className="w-full h-full border-0"
          title="Visualização da página"
          // Configuração mais permissiva para funcionar como página web normal
          sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation allow-forms allow-downloads allow-modals allow-orientation-lock allow-pointer-lock allow-presentation"
          allow="accelerometer; autoplay; camera; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; usb; xr-spatial-tracking"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Modal de Edição de Elemento */}
      <Dialog open={showElementEditor} onOpenChange={setShowElementEditor}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ Editar Elemento</DialogTitle>
            <DialogDescription>
              Edite o texto e estilos do elemento selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Campo de Imagem (se for IMG) */}
            {selectedElement?.tagName === 'IMG' && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4" />
                  <Label className="text-sm font-semibold">Configurações de Imagem</Label>
                </div>
                
                <ImageUpload
                  label="URL da Imagem"
                  description="Cole uma URL ou faça upload de uma nova imagem"
                  value={editingImageSrc}
                  onChange={(url) => setEditingImageSrc(url)}
                  folder="images"
                />
                
                <div>
                  <Label className="text-xs text-foreground">Texto Alternativo (Alt)</Label>
                  <Input
                    placeholder="Descrição da imagem para SEO e acessibilidade"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Importante para SEO e leitores de tela
                  </p>
                </div>
              </div>
            )}
            
            {/* Texto (para elementos não-imagem) */}
            {selectedElement?.tagName !== 'IMG' && (
              <div>
                <Label className="text-xs text-foreground">Texto</Label>
                <Textarea
                  placeholder="Digite o texto..."
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}

            {/* Grid de estilos */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cor do texto */}
              <div>
                <Label className="text-xs text-foreground">Cor do Texto</Label>
                <Input
                  type="color"
                  value={editingStyles.color}
                  onChange={(e) => setEditingStyles(prev => ({...prev, color: e.target.value}))}
                  className="w-full h-10"
                />
              </div>

              {/* Cor de fundo */}
              <div>
                <Label className="text-xs text-foreground">Cor de Fundo</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="transparent-bg"
                      checked={editingStyles.backgroundColor === 'transparent'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingStyles(prev => ({...prev, backgroundColor: 'transparent'}));
                        } else {
                          setEditingStyles(prev => ({...prev, backgroundColor: '#ffffff'}));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="transparent-bg" className="text-xs">Sem Fundo (Transparente)</Label>
                  </div>
                  {editingStyles.backgroundColor !== 'transparent' && (
                    <Input
                      type="color"
                      value={editingStyles.backgroundColor}
                      onChange={(e) => setEditingStyles(prev => ({...prev, backgroundColor: e.target.value}))}
                      className="w-full h-10"
                    />
                  )}
                </div>
              </div>

              {/* Tamanho da fonte */}
              <div>
                <Label className="text-xs text-foreground">Tamanho da Fonte (px)</Label>
                <Input
                  type="number"
                  min="8"
                  max="72"
                  value={editingStyles.fontSize}
                  onChange={(e) => setEditingStyles(prev => ({...prev, fontSize: e.target.value}))}
                  className="w-full"
                />
              </div>

              {/* Padding */}
              <div>
                <Label className="text-xs text-foreground">Espaçamento Interno</Label>
                <Input
                  placeholder="ex: 10px ou 10px 20px"
                  value={editingStyles.padding}
                  onChange={(e) => setEditingStyles(prev => ({...prev, padding: e.target.value}))}
                  className="w-full"
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

              {/* Bordas Arredondadas */}
              <div>
                <Label className="text-xs text-foreground">Bordas Arredondadas (px)</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={parseInt(editingStyles.borderRadius) || 0}
                  onChange={(e) => setEditingStyles(prev => ({...prev, borderRadius: e.target.value + 'px'}))}
                  className="w-full"
                  placeholder="0"
                />
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
            </div>

            {/* Link (se for elemento A) */}
            {selectedElement?.tagName === 'A' && (
              <div>
                <Label className="text-xs text-foreground">Link (URL)</Label>
                <Input
                  type="url"
                  placeholder="https://exemplo.com"
                  value={editingLink}
                  onChange={(e) => setEditingLink(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowElementEditor(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={applyElementChanges}
            >
              Aplicar Mudanças
            </Button>
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

      {/* Modal de Configurações PWA */}
      <Dialog open={showPWASettings} onOpenChange={setShowPWASettings}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Configurações PWA
            </DialogTitle>
            <DialogDescription>
              Transforme sua página em um app instalável com configurações personalizadas
            </DialogDescription>
          </DialogHeader>
          
          {pageData && (
            <PWASettings 
              page={pageData} 
              onUpdate={handlePWAUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Indicador de Modo de Edição */}
      {isEditMode && (
        <div className="absolute bottom-6 left-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-pulse border border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="font-medium">✏️ Modo Edição Ativo</span>
          </div>
          <div className="text-xs opacity-90 mt-1">
            Passe o mouse sobre elementos para editá-los
          </div>
        </div>
      )}
    </div>
  );
}