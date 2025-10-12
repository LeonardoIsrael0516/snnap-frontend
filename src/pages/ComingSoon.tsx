import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ComingSoon() {
  const location = useLocation();
  const pageName = location.pathname.split("/")[1] || "página";

  const pageNames: Record<string, string> = {
    biolinks: "Biolinks",
    "short-links": "Short Links",
    biohub: "BioHub",
    dominios: "Meus Domínios",
    pixels: "Pixels",
    leads: "Leads",
    planos: "Planos",
    configuracoes: "Configurações",
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mt-20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full gradient-instagram flex items-center justify-center mx-auto mb-4">
            <Construction className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl mb-2">
            {pageNames[pageName] || "Página"} em Breve
          </CardTitle>
          <CardDescription className="text-lg">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Por enquanto, você pode explorar a funcionalidade <span className="gradient-instagram-text font-semibold">Link AI</span> que já está disponível!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
