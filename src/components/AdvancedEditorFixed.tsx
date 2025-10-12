import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Save, 
  X, 
  Pencil, 
  Palette, 
  Image, 
  Link, 
  Type,
  Wand2,
  Code,
  Eye,
  ImagePlus
} from "lucide-react";
import { toast } from "sonner";
import { aiPagesService, streamCreatePage } from "@/lib/aiPages";
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import './advanced-editor.css';

interface AdvancedEditorProps {
  pageId: string;
  initialHtml: string;
  onSave?: () => void;
}

interface ImageUploadData {
  file: File;
  preview: string;
}

export function AdvancedEditor({ pageId, initialHtml, onSave }: AdvancedEditorProps) {
  // Estados principais
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'ai'>('visual');
  const [html, setHtml] = useState(initialHtml);
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Estados do editor visual
  const [editorContent, setEditorContent] = useState('');
  const quillRef = useRef<ReactQuill>(null);
  
  // Estados de IA
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Estados de modais
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  
  // Estados de upload de imagem
  const [imageUpload, setImageUpload] = useState<ImageUploadData | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Configuração do Quill com mais opções
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
              handleImageFile(file);
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'script', 'align', 'blockquote', 'code-block',
    'list', 'bullet', 'indent', 'link', 'image', 'video'
  ];

  // Função para processar arquivo de imagem
  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setImageUpload({ file, preview });
      setShowImageUpload(true);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop para imagens
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageFile(imageFile);
    }
  };

  // Extrair conteúdo preservando estrutura original
  const extractContent = (htmlString: string) => {
    if (htmlString.includes('<html') || htmlString.includes('<!DOCTYPE')) {
      const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      return bodyMatch ? bodyMatch[1] : htmlString;
    }
    return htmlString;
  };

  // Reconstruir HTML preservando head e body attributes
  const reconstructHtml = (content: string, originalHtml: string) => {
    if (originalHtml.includes('<html') || originalHtml.includes('<!DOCTYPE')) {
      const bodyMatch = originalHtml.match(/<body([^>]*)>/i);
      const bodyAttributes = bodyMatch ? bodyMatch[1] : '';
      
      return originalHtml.replace(
        /<body[^>]*>[\s\S]*<\/body>/i,
        `<body${bodyAttributes}>${content}</body>`
      );
    }
    return content;
  };

  // Converter HTML para conteúdo do Quill
  useEffect(() => {
    if (html && quillRef.current && isEditMode) {
      const quill = quillRef.current.getEditor();
      const contentToLoad = extractContent(html);
      
      // Limpar e inserir conteúdo
      quill.clipboard.dangerouslyPasteHTML(contentToLoad);
      setEditorContent(contentToLoad);
    }
  }, [html, isEditMode]);

  // Atualizar HTML quando o conteúdo do editor muda
  const handleEditorChange = useCallback((content: string) => {
    setEditorContent(content);
    const updatedHtml = reconstructHtml(content, html);
    setHtmlCode(updatedHtml);
  }, [html]);

  // Processar comando de IA
  const handleAiCommand = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Digite um comando para a IA");
      return;
    }

    setIsAiProcessing(true);
    let htmlContent = "";

    try {
      const currentContent = editorContent || extractContent(html);
      
      const messages = [
        {
          role: "system" as const,
          content: `Você é um especialista em criar e editar páginas web HTML responsivas e modernas.
          
CONTEXTO ATUAL:
${currentContent ? `HTML atual: ${currentContent}` : 'Página nova (sem conteúdo atual)'}

INSTRUÇÕES CRÍTICAS:
- Se existe conteúdo atual, faça APENAS as alterações solicitadas
- PRESERVE todos os estilos, classes CSS e estrutura existente
- NÃO remova ou altere estilos já aplicados
- Se não existe conteúdo, crie uma página nova
- Use HTML semântico e CSS inline/classes para estilização
- Faça páginas responsivas e modernas
- Retorne APENAS o HTML do conteúdo do BODY (sem <html>, <head>, <body>)
- MANTENHA todos os IDs, classes e atributos existentes
- Use cores, gradientes e design moderno quando criar elementos novos
- Otimize para mobile-first`
        },
        {
          role: "user" as const,
          content: aiPrompt
        }
      ];

      await streamCreatePage({
        messages,
        onDelta: (chunk: string, isHtml: boolean) => {
          if (isHtml) {
            htmlContent += chunk;
            
            // Atualizar editor em tempo real
            if (quillRef.current) {
              const quill = quillRef.current.getEditor();
              quill.clipboard.dangerouslyPasteHTML(htmlContent);
              setEditorContent(htmlContent);
              handleEditorChange(htmlContent);
            }
          }
        },
        onDone: () => {
          setIsAiProcessing(false);
          setAiPrompt('');
          toast.success("IA aplicou as alterações!");
        },
        onError: (error) => {
          setIsAiProcessing(false);
          toast.error(`Erro da IA: ${error}`);
        }
      });

    } catch (error) {
      setIsAiProcessing(false);
      console.error('Erro ao processar IA:', error);
      toast.error("Erro ao processar comando da IA");
    }
  };

  // Upload de imagem (atualizado)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  // Inserir imagem no editor
  const insertImage = () => {
    if (imageUpload && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'image', imageUpload.preview);
        quill.setSelection(range.index + 1, 0);
      }
      setImageUpload(null);
      setShowImageUpload(false);
      toast.success("Imagem inserida!");
    }
  };

  // Inserir link
  const insertLink = () => {
    if (linkUrl && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range) {
        if (linkText) {
          // Inserir texto com link
          quill.insertText(range.index, linkText);
          quill.setSelection(range.index, linkText.length);
          quill.format('link', linkUrl);
        } else {
          // Apenas aplicar link ao texto selecionado
          quill.format('link', linkUrl);
        }
      }
      
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
      toast.success("Link inserido!");
    }
  };

  // Salvar página
  const handleSavePage = async () => {
    setIsSaving(true);
    try {
      let finalHtml = htmlCode;
      
      // Se estamos no modo visual, pegar o conteúdo do Quill
      if (activeTab === 'visual' && quillRef.current) {
        const quill = quillRef.current.getEditor();
        const content = quill.root.innerHTML;
        finalHtml = reconstructHtml(content, html);
      }

      await aiPagesService.update(pageId, {
        html_content: finalHtml,
      });

      setHtml(finalHtml);
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
    setHtml(initialHtml);
    setHtmlCode(initialHtml);
    setEditorContent('');
    setIsEditMode(false);
    setActiveTab('visual');
    setShowPreview(false);
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
            Editor Avançado
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant={showPreview ? "default" : "outline"}
              className="shadow-lg"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Ocultar Preview" : "Preview"}
            </Button>
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

      {isEditMode ? (
        <div className="h-full flex flex-col bg-background">
          {/* Tabs do Editor */}
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full flex flex-col">
            <div className="border-b bg-background p-4">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="visual" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Código
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  IA
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Conteúdo das Tabs */}
            <div className="flex-1 overflow-hidden">
              {/* Editor Visual */}
              <TabsContent value="visual" className="h-full m-0 p-4">
                <div className="h-full flex gap-4">
                  {/* Editor Principal */}
                  <div 
                    className={`${showPreview ? 'w-1/2' : 'flex-1'} border rounded-lg overflow-hidden bg-white relative ${
                      isDragging ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isDragging && (
                      <div className="absolute inset-0 z-10 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <ImagePlus className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                          <p className="text-blue-700 font-medium">Solte a imagem aqui</p>
                        </div>
                      </div>
                    )}
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={editorContent}
                      onChange={handleEditorChange}
                      modules={modules}
                      formats={formats}
                      className="h-full"
                      style={{ height: 'calc(100% - 42px)' }}
                    />
                  </div>

                  {/* Preview lado a lado */}
                  {showPreview && (
                    <div className="w-1/2 border rounded-lg overflow-hidden bg-white">
                      <div className="bg-muted px-3 py-2 border-b">
                        <p className="text-sm font-medium">Preview da Página</p>
                      </div>
                      <iframe
                        srcDoc={htmlCode}
                        className="w-full h-full border-0"
                        title="Preview"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ height: 'calc(100% - 42px)' }}
                      />
                    </div>
                  )}

                  {/* Painel Lateral - só aparece quando preview está fechado */}
                  {!showPreview && (
                    <div className="w-80 space-y-4 max-h-full overflow-y-auto">
                      {/* Upload de Imagem */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <ImagePlus className="w-4 h-4" />
                            Imagens
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label htmlFor="image-upload" className="cursor-pointer">
                              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                                <ImagePlus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Clique ou arraste uma imagem
                                </p>
                              </div>
                            </Label>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Links */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button
                            onClick={() => setShowLinkDialog(true)}
                            variant="outline"
                            className="w-full"
                            size="sm"
                          >
                            <Link className="w-4 h-4 mr-2" />
                            Inserir Link
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Cores Rápidas */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Cores Rápidas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Cor do Texto</Label>
                            <div className="grid grid-cols-6 gap-2">
                              {[
                                '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
                                '#ff00ff', '#00ffff', '#888888', '#444444', '#e74c3c', '#2ecc71'
                              ].map((color) => (
                                <button
                                  key={color}
                                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                  onClick={() => {
                                    if (quillRef.current) {
                                      const quill = quillRef.current.getEditor();
                                      quill.format('color', color);
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Editor de Código */}
              <TabsContent value="code" className="h-full m-0 p-4">
                <div className="h-full">
                  <Textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="h-full font-mono text-sm resize-none"
                    placeholder="Digite seu HTML aqui..."
                  />
                </div>
              </TabsContent>

              {/* Editor de IA */}
              <TabsContent value="ai" className="h-full m-0 p-4">
                <div className="max-w-2xl mx-auto space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5" />
                        Assistente de IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Comando para IA</Label>
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Ex: Adicione um botão azul com texto 'Clique aqui', mude a cor do título para vermelho, crie uma seção de contato..."
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={handleAiCommand}
                        disabled={isAiProcessing || !aiPrompt.trim()}
                        className="w-full"
                      >
                        {isAiProcessing ? (
                          <>
                            <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Aplicar com IA
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Exemplos de comandos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Exemplos de Comandos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        "Adicione um botão verde com texto 'Entrar em Contato'",
                        "Mude a cor de fundo para gradiente azul para roxo",
                        "Crie uma seção com 3 cards lado a lado",
                        "Adicione um formulário de contato estilizado",
                        "Insira uma galeria de imagens responsiva",
                        "Mude o título principal para vermelho e maior"
                      ].map((example, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          className="w-full text-left justify-start text-xs h-auto p-2"
                          onClick={() => setAiPrompt(example)}
                        >
                          {example}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      ) : (
        /* Visualização */
        <iframe
          srcDoc={html}
          className="w-full h-full border-0"
          title="Page Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      )}

      {/* Modal de Upload de Imagem */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Imagem</DialogTitle>
          </DialogHeader>
          {imageUpload && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={imageUpload.preview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowImageUpload(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={insertImage}>
                  Inserir Imagem
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Link */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL do Link</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
              />
            </div>
            <div>
              <Label>Texto do Link (opcional)</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Clique aqui"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={insertLink} disabled={!linkUrl}>
                Inserir Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Indicador de Modo de Edição */}
      {isEditMode && (
        <div className="absolute bottom-4 left-4 z-50 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm shadow-lg">
          ✨ Editor Avançado - {activeTab === 'visual' ? 'Visual' : activeTab === 'code' ? 'Código' : 'IA'}
        </div>
      )}
    </div>
  );
}