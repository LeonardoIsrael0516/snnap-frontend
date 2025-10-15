import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 1: email, 2: senha, 3: nome
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    // Capturar código de indicação da URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }

    // Definir callback global para o Google
    (window as any).handleGoogleResponse = (response: any) => {
      handleGoogleLogin(response.credential);
    };

    // Carregar o SDK do Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Inicializar o Google Sign-In
      if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response: any) => handleGoogleLogin(response.credential),
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete (window as any).handleGoogleResponse;
    };
  }, []);

  const handleGoogleLogin = async (credential: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer login com Google');
      }

      const userData = await response.json();
      
      // Salvar dados do usuário e tokens no localStorage
      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('token', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      
      // Calcular e salvar timestamp de expiração
      const expiresAt = Date.now() + (userData.expiresIn * 1000);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
      
      toast.success("Login realizado com sucesso!");
      
      // Redirect baseado no role
      if (userData.user?.role === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/link-ai");
      }
      
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      toast.error(error.message || "Erro ao fazer login com Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer login');
      }

      const userData = await response.json();
      
      // Salvar dados do usuário e tokens no localStorage
      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('token', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      
      // Calcular e salvar timestamp de expiração
      const expiresAt = Date.now() + (userData.expiresIn * 1000);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
      
      toast.success("Login realizado com sucesso!");
      
      // Redirect baseado no role
      if (userData.user?.role === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/link-ai");
      }
      
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStep = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Etapa 1: Validar email
    if (registerStep === 1) {
      if (!formData.email) {
        toast.error("Preencha o email");
        return;
      }
      
      // Verificar se o email já está cadastrado
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();
        
        if (data.exists) {
          toast.error("Este email já está cadastrado");
          setIsLoading(false);
          return;
        }
        
        setRegisterStep(2);
      } catch (error) {
        console.error('Erro ao verificar email:', error);
        toast.error("Erro ao verificar email. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Etapa 2: Validar senha
    if (registerStep === 2) {
      if (!formData.password) {
        toast.error("Preencha a senha");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Senha deve ter pelo menos 6 caracteres");
        return;
      }
      setRegisterStep(3);
      return;
    }
    
    // Etapa 3: Validar nome e enviar
    if (registerStep === 3) {
      if (!formData.name) {
        toast.error("Preencha seu nome");
        return;
      }
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          referralCode: referralCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar conta');
      }

      const userData = await response.json();
      
      // Salvar dados do usuário e tokens no localStorage (login automático)
      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('token', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      
      // Calcular e salvar timestamp de expiração
      const expiresAt = Date.now() + (userData.expiresIn * 1000);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
      
      toast.success("Conta criada com sucesso!");
      
      // Redirect baseado no role
      if (userData.user?.role === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/link-ai");
      }
      
    } catch (error: any) {
      console.error("Erro no registro:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b0d] px-4 py-8">
      <Card className="w-full max-w-md border-none bg-[#0a0b0d] shadow-none">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img 
              src="/snap-sidebar-g.png" 
              alt="Snapy" 
              className="h-10 w-auto object-contain"
            />
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold gradient-instagram-text mb-2">
              {isRegister ? "Criar Conta" : "Bem-vindo"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isRegister 
                ? "Crie sua conta e comece a criar páginas incríveis com IA"
                : "Entre com sua conta para continuar criando"
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6">
          {isRegister ? (
            <>
              {/* Botão Google primeiro */}
              <button
                type="button"
                onClick={() => {
                  if (!window.google) {
                    toast.error('Google SDK ainda não carregou. Aguarde um momento e tente novamente.');
                    return;
                  }
                  
                  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                    toast.error('Google Client ID não configurado. Verifique as variáveis de ambiente.');
                    return;
                  }
                  
                  const tempDiv = document.createElement('div');
                  tempDiv.style.display = 'none';
                  document.body.appendChild(tempDiv);
                  
                  window.google.accounts.id.renderButton(tempDiv, {
                    type: 'standard',
                    size: 'large',
                    width: 300,
                  });
                  
                  const googleButton = tempDiv.querySelector('div[role="button"]') as HTMLElement;
                  if (googleButton) {
                    googleButton.click();
                  }
                  
                  setTimeout(() => {
                    document.body.removeChild(tempDiv);
                  }, 1000);
                }}
                disabled={isLoading}
                className="w-full h-11 text-white font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mb-6"
                style={{ backgroundColor: '#181a1f', borderColor: '#2a2d35' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22252b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181a1f'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-base">Cadastrar com Google</span>
              </button>

              {/* Separador */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0a0b0d] text-slate-400">ou</span>
                </div>
              </div>

              {/* Formulário em etapas */}
              <form onSubmit={handleRegisterStep} className="space-y-4">
                {registerStep === 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      disabled={isLoading}
                      required
                      autoFocus
                      className="bg-slate-900/50 border-slate-800 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                )}

                {registerStep === 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Defina sua senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={isLoading}
                      required
                      autoFocus
                      className="bg-slate-900/50 border-slate-800 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                    <p className="text-xs text-slate-500">Mínimo de 6 caracteres</p>
                  </div>
                )}

                {registerStep === 3 && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Como podemos chamar você?</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome"
                      disabled={isLoading}
                      required
                      autoFocus
                      className="bg-slate-900/50 border-slate-800 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full gradient-instagram text-white hover:opacity-90 transition-opacity h-11 text-base font-semibold mt-6" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {registerStep < 3 ? "Continuar" : "Criar Conta"}
                </Button>

                {registerStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setRegisterStep(registerStep - 1)}
                    className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors"
                    disabled={isLoading}
                  >
                    ← Voltar
                  </button>
                )}
              </form>
            </>
          ) : (
            // Login form (mantém como está)
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  required
                  className="bg-slate-900/50 border-slate-800 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="bg-slate-900/50 border-slate-800 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full gradient-instagram text-white hover:opacity-90 transition-opacity h-11 text-base font-semibold mt-6" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Entrar
              </Button>
            </form>
          )}

          {!isRegister && (
            <>
              {/* Separador */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0a0b0d] text-slate-400">ou</span>
                </div>
              </div>

              {/* Botão Google para Login */}
              <button
                type="button"
                onClick={() => {
                  if (!window.google) {
                    toast.error('Google SDK ainda não carregou. Aguarde um momento e tente novamente.');
                    return;
                  }
                  
                  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                    toast.error('Google Client ID não configurado. Verifique as variáveis de ambiente.');
                    return;
                  }
                  
                  const tempDiv = document.createElement('div');
                  tempDiv.style.display = 'none';
                  document.body.appendChild(tempDiv);
                  
                  window.google.accounts.id.renderButton(tempDiv, {
                    type: 'standard',
                    size: 'large',
                    width: 300,
                  });
                  
                  const googleButton = tempDiv.querySelector('div[role="button"]') as HTMLElement;
                  if (googleButton) {
                    googleButton.click();
                  }
                  
                  setTimeout(() => {
                    document.body.removeChild(tempDiv);
                  }, 1000);
                }}
                disabled={isLoading}
                className="w-full h-11 text-white font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#181a1f', borderColor: '#2a2d35' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22252b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181a1f'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-base">Entrar com Google</span>
              </button>
            </>
          )}
          
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-center text-sm text-slate-400">
              {isRegister 
                ? "Já tem uma conta? "
                : "Não tem uma conta? "
              }
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setRegisterStep(1);
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                disabled={isLoading}
              >
                {isRegister ? "Faça login" : "Crie uma agora"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}