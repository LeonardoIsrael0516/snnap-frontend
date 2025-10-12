import { Globe } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'pt-BR' as const, name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en-US' as const, name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES' as const, name: 'Español (ES)', flag: '🇪🇸' },
];

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();
  
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 p-2"
        >
          <Globe className="w-4 h-4" />
          <span className="sr-only">{t.header.changeLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${
              language === lang.code ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}





