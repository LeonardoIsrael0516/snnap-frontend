import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  Globe,
  Calendar,
  MessageSquare,
  Gift,
} from "lucide-react";
import { useState } from "react";
import { ReferralModal } from "./ReferralModal";

interface MobileMenuProps {
  onNavigate?: () => void;
}

const menuItems = [
  { title: "Snnap", url: "/link-ai", icon: Sparkles, badge: "IA" },
  { title: "Meus Domínios", url: "/dominios", icon: Globe },
  { title: "Agendamentos", url: "/agendamentos", icon: Calendar, badge: "Em breve", disabled: true },
  { title: "Sugestões", url: "/sugestoes", icon: MessageSquare },
  { title: "Indique e Ganhe", action: "referral", icon: Gift, isGradient: true },
];

export function MobileMenu({ onNavigate }: MobileMenuProps) {
  const location = useLocation();
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <img 
          src="/snap-sidebar.png" 
          alt="Snapy" 
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);

            // Botão de indicação
            if ((item as any).action === "referral") {
              return (
                <button
                  key={item.title}
                  onClick={() => setReferralModalOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-muted"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`flex-1 text-left font-medium ${item.isGradient ? "gradient-instagram-text" : ""}`}>
                    {item.title}
                  </span>
                </button>
              );
            }

            if (item.disabled) {
              return (
                <button
                  key={item.title}
                  disabled
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg opacity-60 cursor-not-allowed"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left font-medium">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.title}
                to={item.url}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`flex-1 text-left font-medium ${item.isGradient ? "gradient-instagram-text" : ""}`}>
                  {item.title}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      
      <ReferralModal open={referralModalOpen} onOpenChange={setReferralModalOpen} />
    </div>
  );
}

