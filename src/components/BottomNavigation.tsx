import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenu } from "./MobileMenu";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      id: "board",
      label: "Board",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "snnap",
      label: "Snnap",
      icon: Sparkles,
      path: "/link-ai",
    },
  ];

  const isActive = (path: string) => {
    // For dashboard, also match root path
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Bottom Navigation Bar - Floating design */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <nav className="relative bg-background/70 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl px-2 py-2 max-w-md mx-auto">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center justify-center gap-1.5 px-4 py-2 transition-all duration-300 group text-slate-300"
                >
                  {/* Active indicator - bar on top */}
                  {active && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 shadow-[0_4px_12px_rgba(147,51,234,0.6)] animate-in fade-in duration-300" />
                  )}
                  
                  <Icon 
                    className="h-6 w-6 transition-all duration-300 group-hover:scale-105" 
                    strokeWidth={1.5}
                  />
                  
                  <span className="text-[10px] font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Menu Button with Sheet */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="relative flex flex-col items-center justify-center gap-1.5 px-4 py-2 transition-all duration-300 group text-slate-300">
                  <Menu className="h-6 w-6 group-hover:scale-105 transition-transform duration-300" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-300">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <MobileMenu onNavigate={() => setIsMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
}

