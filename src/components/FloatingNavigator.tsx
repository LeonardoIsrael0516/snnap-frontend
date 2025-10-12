import { Link, useLocation } from "react-router-dom";
import { Sparkles, Globe, Calendar, MessageSquare, Gift } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useState } from "react";
import { ReferralModal } from "./ReferralModal";

interface FloatingNavigatorProps {
  onNavigate?: () => void;
}

export function FloatingNavigator({ onNavigate }: FloatingNavigatorProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const menuItems = [
    { title: t.sidebar.snapylink, url: "/link-ai", icon: Sparkles, badge: t.sidebar.aiBadge },
    { title: t.sidebar.customDomains, url: "/dominios", icon: Globe },
    { title: "Agendamentos", url: "/agendamentos", icon: Calendar, badge: "Em breve" },
    { title: "Sugestões", url: "/sugestoes", icon: MessageSquare },
    { title: "Indique e Ganhe", action: "referral", icon: Gift, isGradient: true },
  ];

  // Páginas onde o FloatingNavigator deve aparecer (apenas páginas principais)
  const allowedPages = ["/link-ai", "/dominios", "/sugestoes"];
  
  // Verificar se a página atual é exatamente uma das páginas permitidas
  const shouldShowNavigator = allowedPages.includes(location.pathname);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Não renderizar se não for uma página permitida
  if (!shouldShowNavigator) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 z-50 hidden md:block">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-2">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);

            // Botão de indicação
            if ((item as any).action === "referral") {
              return (
                <div
                  key={item.title}
                  className="relative group"
                >
                  <button
                    onClick={() => setReferralModalOpen(true)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-muted"
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${item.isGradient ? "gradient-instagram-text" : ""}`}>
                        {item.title}
                      </span>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45"></div>
                  </div>
                </div>
              );
            }

            if (item.title === "Agendamentos") {
              return (
                <div
                  key={item.title}
                  className="relative group"
                >
                  <button
                    disabled
                    className="w-12 h-12 flex items-center justify-center rounded-xl opacity-60 cursor-not-allowed transition-all duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45"></div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.title}
                className="relative group"
              >
                <Link
                  to={item.url}
                  onClick={onNavigate}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
                
                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${item.isGradient ? "gradient-instagram-text" : ""}`}>
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <ReferralModal open={referralModalOpen} onOpenChange={setReferralModalOpen} />
    </div>
  );
}
