import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Key } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [user, setUser] = useState<User | null>(null);
  
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Token da URL (se veio do link do email)
  const tokenFromUrl = searchParams.get('token');

  useEffect(() => {
    // Se tem token na URL, verificar se é válido
    if (tokenFromUrl) {
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const verifyToken = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setUser(data.user);
        setStep('reset');
        toast.success('Token válido! Agora você pode redefinir sua senha.');
      } else {
        toast.error(data.error || 'Token inválido ou expirado');
        setStep('email');
      }
    } catch (error) {
      toast.error('Erro ao verificar token');
      setStep('email');
    } finally {
      setIsLoading(false);
    }
  };

  const sendResetEmail = async () => {
    if (!email) {
      toast.error('Digite seu email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setStep('reset');
        // Simular dados do usuário (não revelados por segurança)
        setUser({ id: '', email, name: '' });
      } else {
        toast.error(data.error || 'Erro ao enviar email');
      }
    } catch (error) {
      toast.error('Erro ao enviar email de redefinição');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token: tokenFromUrl || resetCode,
          password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        navigate('/login', { 
          state: { message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' }
        });
      } else {
        toast.error(data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      toast.error('Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {step === 'email' ? 'Esqueceu sua senha?' : 'Redefinir Senha'}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {step === 'email' 
              ? 'Digite seu email para receber instruções de redefinição'
              : 'Digite o código recebido por email e sua nova senha'
            }
          </p>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {step === 'email' ? <Mail className="h-5 w-5" /> : <Key className="h-5 w-5" />}
              {step === 'email' ? 'Enviar Código' : 'Nova Senha'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {step === 'email' 
                ? 'Enviaremos um código de 6 dígitos para seu email'
                : 'Use o código recebido por email para redefinir sua senha'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'email' ? (
              <>
                <div>
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <Button 
                  onClick={sendResetEmail} 
                  disabled={isLoading}
                  className="w-full gradient-instagram text-white hover:opacity-90 transition-opacity h-11 text-base font-semibold"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Código de Recuperação
                </Button>
              </>
            ) : (
              <>
                {!tokenFromUrl && (
                  <div>
                    <Label htmlFor="resetCode" className="text-slate-200">Código de Verificação</Label>
                    <Input
                      id="resetCode"
                      type="text"
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      disabled={isLoading}
                      maxLength={6}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <p className="text-sm text-slate-400 mt-1">
                      Digite o código de 6 dígitos recebido por email
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="password" className="text-slate-200">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <Button 
                  onClick={resetPassword} 
                  disabled={isLoading}
                  className="w-full gradient-instagram text-white hover:opacity-90 transition-opacity h-11 text-base font-semibold"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Redefinir Senha
                </Button>
              </>
            )}

            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={goBackToLogin}
                className="text-sm text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>

        {step === 'reset' && (
          <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-2">📧 Instruções:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Verifique sua caixa de entrada e spam</li>
                  <li>• O código expira em 15 minutos</li>
                  <li>• Se não recebeu, tente novamente</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
