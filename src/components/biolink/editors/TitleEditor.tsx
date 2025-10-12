import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { EmojiPicker } from "../EmojiPicker";
import { IconPicker } from "../IconPicker";

interface TitleEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function TitleEditor({ data, onChange }: TitleEditorProps) {
  const columns = data.columns || 1;
  const titles = data.titles || [{ 
    text: data.text || 'Título', 
    level: data.level || 'h2', 
    color: data.color || '#000000', 
    showIcon: data.showIcon || false, 
    iconType: data.iconType || 'none', 
    icon: data.icon || '' 
  }];

  const updateTitle = (index: number, field: string, value: any) => {
    const newTitles = [...titles];
    newTitles[index] = { ...newTitles[index], [field]: value };
    onChange({ ...data, titles: newTitles });
  };

  const addTitle = () => {
    const newTitles = [...titles, {
      text: `Título ${titles.length + 1}`,
      level: 'h2',
      color: '#000000',
      showIcon: false,
      iconType: 'none',
      icon: ''
    }];
    onChange({ ...data, titles: newTitles });
  };

  const removeTitle = (index: number) => {
    if (titles.length > 1) {
      const newTitles = titles.filter((_, i) => i !== index);
      onChange({ ...data, titles: newTitles });
    }
  };

  const handleColumnsChange = (value: string) => {
    const newColumns = parseInt(value);
    onChange({ ...data, columns: newColumns });
    
    // Se mudou para 1 coluna, usar apenas o primeiro título mas preservar alignment
    if (newColumns === 1) {
      onChange({ 
        ...data, 
        columns: newColumns, 
        alignment: data.alignment || 'center',
        text: titles[0]?.text || 'Título', 
        level: titles[0]?.level || 'h2', 
        color: titles[0]?.color || '#000000', 
        showIcon: titles[0]?.showIcon || false, 
        iconType: titles[0]?.iconType || 'none', 
        icon: titles[0]?.icon || '' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Layout */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="columns">Layout</Label>
          <Select
            value={columns.toString()}
            onValueChange={handleColumnsChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 coluna (largura total)</SelectItem>
              <SelectItem value="2">2 colunas</SelectItem>
              <SelectItem value="3">3 colunas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {columns === 1 && (
          <div>
            <Label htmlFor="alignment">Alinhamento</Label>
            <Select
              value={data.alignment || 'center'}
              onValueChange={(value) => onChange({ ...data, alignment: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centralizado</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      {/* Títulos */}
      {columns === 1 ? (
        // Modo 1 coluna - edição simples
        <div className="space-y-4">
          <div>
            <Label htmlFor="text">Texto do Título</Label>
            <Input
              id="text"
              value={titles[0]?.text || ''}
              onChange={(e) => updateTitle(0, 'text', e.target.value)}
              placeholder="Seu título aqui"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="level">Tamanho</Label>
            <Select
              value={titles[0]?.level || 'h2'}
              onValueChange={(value) => updateTitle(0, 'level', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">Grande (H1)</SelectItem>
                <SelectItem value="h2">Médio (H2)</SelectItem>
                <SelectItem value="h3">Pequeno (H3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="color">Cor do Título</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="color"
                type="color"
                value={titles[0]?.color || '#000000'}
                onChange={(e) => updateTitle(0, 'color', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={titles[0]?.color || '#000000'}
                onChange={(e) => updateTitle(0, 'color', e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showIcon">Mostrar ícone/emoji</Label>
              <Switch
                id="showIcon"
                checked={titles[0]?.showIcon || false}
                onCheckedChange={(checked) => updateTitle(0, 'showIcon', checked)}
              />
            </div>

            {titles[0]?.showIcon && (
              <div>
                <Label htmlFor="icon-type">Tipo de Ícone</Label>
                <Select 
                  value={titles[0]?.iconType || 'none'} 
                  onValueChange={(value) => updateTitle(0, 'iconType', value)}
                >
                  <SelectTrigger id="icon-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="emoji">Emoji</SelectItem>
                    <SelectItem value="icon">Ícone (Font Awesome)</SelectItem>
                  </SelectContent>
                </Select>

                {titles[0]?.iconType === 'emoji' && (
                  <div className="mt-2">
                    <EmojiPicker
                      value={titles[0]?.icon || ''}
                      onChange={(emoji) => updateTitle(0, 'icon', emoji)}
                    />
                  </div>
                )}

                {titles[0]?.iconType === 'icon' && (
                  <div className="mt-2">
                    <IconPicker
                      value={titles[0]?.icon || ''}
                      onChange={(icon) => updateTitle(0, 'icon', icon)}
                    />
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      ) : (
        // Modo 2-3 colunas - múltiplos títulos
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Títulos ({titles.length})</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTitle}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Título
            </Button>
          </div>

          {titles.map((title: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Título {index + 1}</Label>
                {titles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTitle(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`text-${index}`}>Texto</Label>
                <Input
                  id={`text-${index}`}
                  value={title.text || ''}
                  onChange={(e) => updateTitle(index, 'text', e.target.value)}
                  placeholder={`Título ${index + 1}`}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`level-${index}`}>Tamanho</Label>
                <Select
                  value={title.level || 'h2'}
                  onValueChange={(value) => updateTitle(index, 'level', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">Grande (H1)</SelectItem>
                    <SelectItem value="h2">Médio (H2)</SelectItem>
                    <SelectItem value="h3">Pequeno (H3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`color-${index}`}>Cor</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id={`color-${index}`}
                    type="color"
                    value={title.color || '#000000'}
                    onChange={(e) => updateTitle(index, 'color', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={title.color || '#000000'}
                    onChange={(e) => updateTitle(index, 'color', e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`showIcon-${index}`}>Mostrar ícone/emoji</Label>
                  <Switch
                    id={`showIcon-${index}`}
                    checked={title.showIcon || false}
                    onCheckedChange={(checked) => updateTitle(index, 'showIcon', checked)}
                  />
                </div>

                {title.showIcon && (
                  <div>
                    <Label htmlFor={`icon-type-${index}`}>Tipo de Ícone</Label>
                    <Select 
                      value={title.iconType || 'none'} 
                      onValueChange={(value) => updateTitle(index, 'iconType', value)}
                    >
                      <SelectTrigger id={`icon-type-${index}`} className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="emoji">Emoji</SelectItem>
                        <SelectItem value="icon">Ícone (Font Awesome)</SelectItem>
                      </SelectContent>
                    </Select>

                    {title.iconType === 'emoji' && (
                      <div className="mt-2">
                        <EmojiPicker
                          value={title.icon || ''}
                          onChange={(emoji) => updateTitle(index, 'icon', emoji)}
                        />
                      </div>
                    )}

                    {title.iconType === 'icon' && (
                      <div className="mt-2">
                        <IconPicker
                          value={title.icon || ''}
                          onChange={(icon) => updateTitle(index, 'icon', icon)}
                        />
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}