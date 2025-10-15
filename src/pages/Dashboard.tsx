import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Eye, Settings, Loader2 } from "lucide-react";
import { aiPagesService } from "@/lib/aiPages";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface DashboardStats {
  totalPages: number;
  totalViews: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPages: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadStats();
    } catch (error) {
      console.error('Erro ao fazer parse dos dados do usuário:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const pages = await aiPagesService.getAll();
      
      const totalPages = pages.length;
      const totalViews = pages.reduce((sum, page) => sum + (page.views || 0), 0);
      
      setStats({
        totalPages,
        totalViews,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (!user) {
    return null; // Loading state
  }
  return (
    <div className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 gradient-instagram-text">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Bem-vindo, {user.name}!
          </p>
        </div>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {loading ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Páginas
                </CardTitle>
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Visualizações
                </CardTitle>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Páginas
                </CardTitle>
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats.totalPages}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPages === 0 ? 'Nenhuma página criada' : 
                   stats.totalPages === 1 ? '1 página criada' : 
                   `${stats.totalPages} páginas criadas`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Visualizações
                </CardTitle>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{(stats.totalViews || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total de visualizações em todas as páginas
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/link-ai/create')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Criar Página IA
            </CardTitle>
            <CardDescription>
              Use IA para criar páginas personalizadas
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/biolinks')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Gerenciar Biolinks
            </CardTitle>
            <CardDescription>
              Crie e edite seus bio links
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/link-ai')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Minhas Páginas
            </CardTitle>
            <CardDescription>
              Visualize e edite suas páginas criadas
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
