import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DividerEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function DividerEditor({ data, onChange }: DividerEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="style">Estilo</Label>
        <Select
          value={data.style || 'solid'}
          onValueChange={(value) => onChange({ ...data, style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Sólido</SelectItem>
            <SelectItem value="dashed">Tracejado</SelectItem>
            <SelectItem value="dotted">Pontilhado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <div
          className="h-px w-full bg-foreground"
          style={{
            borderTop: `2px ${data.style || 'solid'} currentColor`,
          }}
        />
      </div>
    </div>
  );
}
