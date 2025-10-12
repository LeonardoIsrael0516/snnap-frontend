import { ReactNode } from "react";
import { UserMenu } from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingNavigator } from "./FloatingNavigator";
import { TranslationProvider } from "@/contexts/TranslationContext";

interface LayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean; // Prop para ocultar Bottom Navigation em páginas específicas
}

export function Layout({ children, hideBottomNav = false }: LayoutProps) {
  return (
    <TranslationProvider>
      <div className="min-h-screen w-full bg-background">
        {/* Floating Navigator */}
        <FloatingNavigator />
        
        <div className="flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            {/* Logo no header */}
            <div className="flex-1 flex justify-start">
              <img 
                src="/snap-sidebar-g.png" 
                alt="Snapy" 
                className="h-6 w-auto object-contain"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <UserMenu />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto pb-0 md:pb-0">
            {children}
          </main>
        </div>
        
        {/* Mobile Bottom Navigation - Oculto em páginas de edição */}
        {!hideBottomNav && <BottomNavigation />}
      </div>
    </TranslationProvider>
  );
}
