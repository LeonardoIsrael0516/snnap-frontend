import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CTAEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function CTAEditor({ data, onChange }: CTAEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Texto do Botão</Label>
        <Input
          id="text"
          value={data.text || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Ex: Comprar Agora"
        />
      </div>
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={data.url || ''}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label htmlFor="style">Estilo</Label>
        <Select
          value={data.style || 'primary'}
          onValueChange={(value) => onChange({ ...data, style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primário</SelectItem>
            <SelectItem value="secondary">Secundário</SelectItem>
            <SelectItem value="outline">Contorno</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
