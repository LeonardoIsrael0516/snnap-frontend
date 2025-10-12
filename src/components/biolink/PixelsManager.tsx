import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PixelsManagerProps {
  pixels: {
    facebookPixel?: string;
    googleAnalytics?: string;
    googleTagManager?: string;
    tiktokPixel?: string;
    linkedinPixel?: string;
    twitterPixel?: string;
  };
  onPixelsChange: (pixels: PixelsManagerProps['pixels']) => void;
}

export function PixelsManager({ pixels, onPixelsChange }: PixelsManagerProps) {
  const updatePixel = (key: keyof PixelsManagerProps['pixels'], value: string) => {
    onPixelsChange({ ...pixels, [key]: value });
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Pixels de Rastreamento</Label>
      <p className="text-sm text-muted-foreground mb-4">
        Insira apenas o ID de cada plataforma. O código completo será gerado automaticamente.
      </p>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
          <Input
            id="facebook-pixel"
            placeholder="Apenas o ID do pixel (ex: 123456789012345)"
            value={pixels.facebookPixel || ""}
            onChange={(e) => updatePixel('facebookPixel', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="google-analytics">Google Analytics ID</Label>
          <Input
            id="google-analytics"
            placeholder="Apenas o ID de medição (ex: G-XXXXXXXXXX)"
            value={pixels.googleAnalytics || ""}
            onChange={(e) => updatePixel('googleAnalytics', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="google-tag-manager">Google Tag Manager ID</Label>
          <Input
            id="google-tag-manager"
            placeholder="Apenas o ID do container (ex: GTM-XXXXXXX)"
            value={pixels.googleTagManager || ""}
            onChange={(e) => updatePixel('googleTagManager', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktok-pixel">TikTok Pixel ID</Label>
          <Input
            id="tiktok-pixel"
            placeholder="Apenas o ID do pixel (ex: CXXXXXXXXXXXXXXX)"
            value={pixels.tiktokPixel || ""}
            onChange={(e) => updatePixel('tiktokPixel', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin-pixel">LinkedIn Pixel ID</Label>
          <Input
            id="linkedin-pixel"
            placeholder="Apenas o ID do pixel (ex: 1234567)"
            value={pixels.linkedinPixel || ""}
            onChange={(e) => updatePixel('linkedinPixel', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter-pixel">Twitter Pixel ID</Label>
          <Input
            id="twitter-pixel"
            placeholder="Apenas o ID do pixel (ex: o0p1q2r3s4t5u6v7)"
            value={pixels.twitterPixel || ""}
            onChange={(e) => updatePixel('twitterPixel', e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
}