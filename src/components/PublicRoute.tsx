import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  // Verificar se o usuário está autenticado
  const token = localStorage.getItem('token');
  const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
  
  // Se tem token e não expirou, está autenticado
  const isAuthenticated = token && tokenExpiresAt && Date.now() < parseInt(tokenExpiresAt);
  
  // Se estiver autenticado, redireciona para o painel
  if (isAuthenticated) {
    return <Navigate to="/link-ai" replace />;
  }
  
  // Se não estiver autenticado, mostra a página pública
  return <>{children}</>;
}






