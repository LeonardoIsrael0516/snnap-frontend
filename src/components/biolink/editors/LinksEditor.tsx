import { Plus, Trash2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { EmojiPicker } from "../EmojiPicker";
import { IconPicker } from "../IconPicker";
import { ImageUpload } from "../ImageUpload";

interface LinksEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function LinksEditor({ data, onChange }: LinksEditorProps) {
  const links = data.links || [{ 
    text: '', 
    url: '', 
    backgroundColor: '#000000', 
    textColor: '#ffffff', 
    icon: '', 
    iconType: 'none',
    openInNewTab: true 
  }];
  
  const columns = data.columns || 1;
  const showIcons = data.showIcons || false;

  const addLink = () => {
    onChange({ 
      ...data, 
      links: [...links, { 
        text: '', 
        url: '', 
        backgroundColor: '#000000', 
        textColor: '#ffffff', 
        icon: '', 
        iconType: 'none',
        openInNewTab: true 
      }] 
    });
  };

  const removeLink = (index: number) => {
    onChange({ ...data, links: links.filter((_: any, i: number) => i !== index) });
  };

  const updateLink = (index: number, field: string, value: any) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({ ...data, links: newLinks });
  };

  const updateGlobalSetting = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Configurações Globais */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Configurações Gerais</h3>
        <div className="space-y-4">
          {/* Colunas */}
          <div>
            <Label htmlFor="columns">Layout dos Links</Label>
            <Select value={columns.toString()} onValueChange={(value) => updateGlobalSetting('columns', parseInt(value))}>
              <SelectTrigger id="columns" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 coluna (largura total)</SelectItem>
                <SelectItem value="2">2 colunas</SelectItem>
                <SelectItem value="3">3 colunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mostrar Ícones */}
          <div className="flex items-center justify-between">
            <Label htmlFor="showIcons">Mostrar ícones/imagens</Label>
            <Switch
              id="showIcons"
              checked={showIcons}
              onCheckedChange={(checked) => updateGlobalSetting('showIcons', checked)}
            />
          </div>
        </div>
      </Card>

      <Separator />

      {/* Links */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Links</h3>
          <Button variant="outline" onClick={addLink} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Link
          </Button>
        </div>

        {links.map((link: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Link {index + 1}</Label>
                {links.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Texto e URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`text-${index}`}>Texto do Link</Label>
                  <Input
                    id={`text-${index}`}
                    value={link.text}
                    onChange={(e) => updateLink(index, 'text', e.target.value)}
                    placeholder="Texto do link"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`url-${index}`}>URL</Label>
                  <Input
                    id={`url-${index}`}
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Cores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`bg-${index}`}>Cor de Fundo</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id={`bg-${index}`}
                      type="color"
                      value={link.backgroundColor}
                      onChange={(e) => updateLink(index, 'backgroundColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={link.backgroundColor}
                      onChange={(e) => updateLink(index, 'backgroundColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`text-color-${index}`}>Cor do Texto</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id={`text-color-${index}`}
                      type="color"
                      value={link.textColor}
                      onChange={(e) => updateLink(index, 'textColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={link.textColor}
                      onChange={(e) => updateLink(index, 'textColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Ícone/Imagem */}
              {showIcons && (
                <div>
                  <Label htmlFor={`icon-type-${index}`}>Tipo de Ícone</Label>
                  <Select 
                    value={link.iconType || 'none'} 
                    onValueChange={(value) => updateLink(index, 'iconType', value)}
                  >
                    <SelectTrigger id={`icon-type-${index}`} className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="emoji">Emoji</SelectItem>
                      <SelectItem value="icon">Ícone (Font Awesome)</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                    </SelectContent>
                  </Select>

                  {link.iconType === 'emoji' && (
                    <div className="mt-2">
                      <EmojiPicker
                        value={link.icon}
                        onChange={(emoji) => updateLink(index, 'icon', emoji)}
                      />
                    </div>
                  )}

                  {link.iconType === 'icon' && (
                    <div className="mt-2">
                      <IconPicker
                        value={link.icon}
                        onChange={(icon) => updateLink(index, 'icon', icon)}
                      />
                    </div>
                  )}

                  {link.iconType === 'image' && (
                    <div className="mt-2">
                      <ImageUpload
                        value={link.icon}
                        onChange={(url) => updateLink(index, 'icon', url)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Abrir em nova aba */}
              <div className="flex items-center justify-between">
                <Label htmlFor={`new-tab-${index}`}>Abrir em nova aba</Label>
                <Switch
                  id={`new-tab-${index}`}
                  checked={link.openInNewTab !== false}
                  onCheckedChange={(checked) => updateLink(index, 'openInNewTab', checked)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
