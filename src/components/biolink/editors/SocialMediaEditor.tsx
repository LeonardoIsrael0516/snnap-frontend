import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SocialMediaEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const socialPlatforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'github', label: 'GitHub' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export function SocialMediaEditor({ data, onChange }: SocialMediaEditorProps) {
  const platforms = data.platforms || [{ platform: 'instagram', url: '' }];

  const addPlatform = () => {
    onChange({ ...data, platforms: [...platforms, { platform: 'instagram', url: '' }] });
  };

  const removePlatform = (index: number) => {
    onChange({ ...data, platforms: platforms.filter((_: any, i: number) => i !== index) });
  };

  const updatePlatform = (index: number, field: string, value: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], [field]: value };
    onChange({ ...data, platforms: newPlatforms });
  };

  return (
    <div className="space-y-4">
      {platforms.map((platform: any, index: number) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Rede Social {index + 1}</Label>
              {platforms.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlatform(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Select
              value={platform.platform}
              onValueChange={(value) => updatePlatform(index, 'platform', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={platform.url}
              onChange={(e) => updatePlatform(index, 'url', e.target.value)}
              placeholder="URL do perfil"
            />
          </div>
        </Card>
      ))}
      <Button variant="outline" onClick={addPlatform} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Rede Social
      </Button>
    </div>
  );
}
