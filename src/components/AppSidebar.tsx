import { Link, useLocation } from "react-router-dom";
import {
  Link2,
  Sparkles,
  Code,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const getMenuItems = (t: any) => [
  { title: t.sidebar.snapylink, url: "/link-ai", icon: Sparkles, badge: t.sidebar.aiBadge },
  { title: t.sidebar.customDomains, url: "/dominios", icon: Code },
  { title: "Agendamentos", url: "/agendamentos", icon: Calendar, badge: "Em breve" },
  { title: "Sugestões", url: "/sugestoes", icon: MessageSquare },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps = {}) {
  const { state } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    // For home page, only match exact path
    if (path === "/") {
      return location.pathname === path;
    }
    // For other paths, match if the current path starts with the menu path
    return location.pathname.startsWith(path);
  };
  const menuItems = getMenuItems(t);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-center px-2 py-4">
           {!isCollapsed && (
             <img 
               src="/snap-sidebar-g.png" 
               alt="Snapy" 
               className="h-8 w-auto object-contain"
             />
           )}
          {isCollapsed && (
            <img 
              src="/snap-sidebar-colapsed.png" 
              alt="Snapylink" 
              className="h-12 w-12 object-contain"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  {item.title === "Agendamentos" ? (
                    <SidebarMenuButton
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={
                        isActive(item.url)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <Link to={item.url} onClick={onNavigate}>
                        <item.icon className="w-4 h-4" />
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <span className={`${item.title === "Snapylink" ? "font-semibold" : "font-medium"} ${item.isGradient ? "gradient-instagram-text" : ""}`}>
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
