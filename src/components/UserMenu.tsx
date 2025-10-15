import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Settings,
  CreditCard,
  ChevronDown,
  LogOut,
  Coins,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import UserPlanModal from "@/components/UserPlanModal";

// Interface para dados do usuário
interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userPlanModalOpen, setUserPlanModalOpen] = useState(false);
  const [credits, setCredits] = useState<{ available: number; total: number; planName: string } | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const { t } = useTranslation();

  // Função para buscar créditos do usuário
  const fetchCredits = async () => {
    if (!user?.id) return;
    
    setLoadingCredits(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCredits({
          available: data.credits?.available || 0,
          total: data.credits?.total || 0,
          planName: data.plan?.name || 'Free'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar créditos:', error);
    } finally {
      setLoadingCredits(false);
    }
  };

  // Carregar dados do usuário do localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  }, []);

  // Buscar créditos quando o usuário estiver carregado
  useEffect(() => {
    if (user?.id) {
      fetchCredits();
    }
  }, [user?.id]);

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-md transition-colors">
            <Avatar className="w-7 h-7">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="gradient-instagram text-white text-xs">
                {user?.name
                  ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-foreground">
                {user?.name || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {/* Barra de Créditos */}
          {(credits || loadingCredits) && (
            <div className="px-3 py-2 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Créditos</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {loadingCredits ? 'Carregando...' : credits?.planName}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {loadingCredits ? '...' : `${credits?.available || 0} disponíveis`}
                  </span>
                  <span className="text-muted-foreground">
                    {loadingCredits ? '...' : `${credits?.total || 0} total`}
                  </span>
                </div>
                <Progress 
                  value={loadingCredits ? 0 : ((credits?.available || 0) / (credits?.total || 1)) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          )}
          
          <DropdownMenuItem asChild>
            <Link to="/configuracoes" className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              {t.userMenu.settings}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setUserPlanModalOpen(true);
              setOpen(false); // Fechar o dropdown
            }}
            className="cursor-pointer"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Planos e Créditos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t.userMenu.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Plan Modal */}
      <UserPlanModal 
        open={userPlanModalOpen} 
        onOpenChange={(open) => {
          setUserPlanModalOpen(open);
          // Atualizar créditos quando o modal for fechado
          if (!open) {
            fetchCredits();
          }
        }} 
      />
    </>
  );
}
