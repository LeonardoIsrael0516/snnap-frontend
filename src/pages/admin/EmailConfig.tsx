import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

interface EmailConfig {
  sendgridApiKey: string;
  sendgridFromEmail: string;
  isConfigured: boolean;
}

export default function EmailConfig() {
  const [config, setConfig] = useState<EmailConfig>({
    sendgridApiKey: '',
    sendgridFromEmail: '',
    isConfigured: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/email-config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveConfig = async () => {
    if (!config.sendgridApiKey || !config.sendgridFromEmail) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/email-config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sendgridApiKey: config.sendgridApiKey,
          sendgridFromEmail: config.sendgridFromEmail
        })
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
        await loadConfig();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const testConfig = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }

    setIsTesting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/email-config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Email de teste enviado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao enviar email de teste');
      }
    } catch (error) {
      toast.error('Erro ao enviar email de teste');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações de Email</h1>
        <p className="text-gray-600 mt-2">
          Configure o SendGrid para envio de emails de redefinição de senha e notificações.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status da Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Status da Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {config.isConfigured ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">SendGrid Configurado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-600 font-medium">SendGrid Não Configurado</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {config.isConfigured 
                ? 'O sistema de email está funcionando corretamente.'
                : 'Configure o SendGrid para habilitar o envio de emails.'
              }
            </p>
          </CardContent>
        </Card>

        {/* Configurações do SendGrid */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do SendGrid</CardTitle>
            <CardDescription>
              Insira suas credenciais do SendGrid para habilitar o envio de emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">SendGrid API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.sendgridApiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, sendgridApiKey: e.target.value }))}
              />
              <p className="text-sm text-gray-600 mt-1">
                Encontre sua API Key no painel do SendGrid em Settings → API Keys
              </p>
            </div>

            <div>
              <Label htmlFor="fromEmail">Email Remetente</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="noreply@seudominio.com"
                value={config.sendgridFromEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, sendgridFromEmail: e.target.value }))}
              />
              <p className="text-sm text-gray-600 mt-1">
                Email que aparecerá como remetente (deve estar verificado no SendGrid)
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveConfig} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Configuração</CardTitle>
            <CardDescription>
              Envie um email de teste para verificar se a configuração está funcionando.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Email de Teste</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <Button onClick={testConfig} disabled={isTesting || !config.isConfigured}>
              {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Email de Teste
            </Button>

            {!config.isConfigured && (
              <p className="text-sm text-yellow-600">
                Configure o SendGrid primeiro para poder enviar emails de teste.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• A API Key do SendGrid deve ter permissões de envio de email</p>
            <p>• O email remetente deve estar verificado no SendGrid</p>
            <p>• O sistema usa o SendGrid para emails de redefinição de senha</p>
            <p>• Emails de teste são enviados para verificar a configuração</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
