import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Check, AlertCircle, Users, Settings, Loader2, Trash2, Database, MessageSquare, FileText } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const getStoredKeys = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        openai: data.openai_api_key || "",
        gemini: data.gemini_api_key || "",
        claude: data.anthropic_api_key || ""
      };
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  
  return { openai: "", gemini: "", claude: "" };
};

export default function Admin() {
  const [apiKeys, setApiKeys] = useState({ openai: "", gemini: "", claude: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({ openai: false, gemini: false, claude: false });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    gemini: false,
    claude: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const keys = await getStoredKeys();
      setApiKeys(keys);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (provider: keyof typeof apiKeys) => {
    if (!apiKeys[provider].trim()) {
      toast.error("Por favor, insira uma chave de API válida");
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [provider]: true }));
      
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          [provider === 'claude' ? 'anthropic_api_key' : `${provider}_api_key`]: apiKeys[provider]
        })
      });

      if (response.ok) {
        toast.success(`Token ${String(provider).toUpperCase()} salvo com sucesso!`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao salvar configuração");
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error("Erro ao salvar token");
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleRemove = async (provider: keyof typeof apiKeys) => {
    if (!confirm(`Tem certeza que deseja remover a chave ${String(provider).toUpperCase()}? Isso desativará a funcionalidade de IA para este provedor.`)) {
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [provider]: true }));
      
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          [provider === 'claude' ? 'anthropic_api_key' : `${provider}_api_key`]: ""
        })
      });

      if (response.ok) {
        setApiKeys(prev => ({ ...prev, [provider]: "" }));
        toast.success(`Token ${String(provider).toUpperCase()} removido com sucesso!`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao remover configuração");
      }
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error("Erro ao remover token");
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleToggleVisibility = (provider: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const isConfigured = (key: string) => key && key.length > 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-instagram-text">Painel Admin</h1>
        <p className="text-muted-foreground">
          Configure as integrações com provedores de IA e gerencie o sistema
        </p>
      </div>

      {/* Admin Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Gerenciar Usuários</CardTitle>
                <CardDescription>
                  Visualizar, editar e gerenciar contas de usuários
                </CardDescription>
              </div>
              <Users className="h-8 w-8 text-blue-500 ml-auto" />
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/storage">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Storage S3</CardTitle>
                <CardDescription>
                  Configurar armazenamento de arquivos (Wasabi, AWS, etc.)
                </CardDescription>
              </div>
              <Database className="h-8 w-8 text-purple-500 ml-auto" />
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/suggestions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Sugestões</CardTitle>
                <CardDescription>
                  Visualizar e gerenciar sugestões dos usuários
                </CardDescription>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500 ml-auto" />
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/templates">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Templates</CardTitle>
                <CardDescription>
                  Gerenciar templates do InspireBox
                </CardDescription>
              </div>
              <FileText className="h-8 w-8 text-green-500 ml-auto" />
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/plans">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Planos & Créditos</CardTitle>
                <CardDescription>
                  Gerenciar planos de assinatura e pacotes de créditos
                </CardDescription>
              </div>
              <Settings className="h-8 w-8 text-yellow-500 ml-auto" />
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/user-plans">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-pink-500">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Planos de Usuários</CardTitle>
                <CardDescription>
                  Atribuir planos e gerenciar créditos dos usuários
                </CardDescription>
              </div>
              <Users className="h-8 w-8 text-pink-500 ml-auto" />
            </CardHeader>
          </Card>
        </Link>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">Configurações API</CardTitle>
              <CardDescription>
                Configurar tokens dos provedores de IA
              </CardDescription>
            </div>
            <Settings className="h-8 w-8 text-green-500 ml-auto" />
          </CardHeader>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <span>Carregando configurações...</span>
        </div>
      ) : (
        <div className="space-y-6">
        {/* OpenAI */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  OpenAI API
                </CardTitle>
                <CardDescription>
                  Configure sua chave de API da OpenAI (GPT-4, GPT-5, etc.)
                </CardDescription>
              </div>
              {isConfigured(apiKeys.openai) ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                  <Check className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Não configurado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openai-key">Token da API</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="openai-key"
                  type={showKeys.openai ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                />
                <Button
                  variant="outline"
                  onClick={() => handleToggleVisibility("openai")}
                >
                  {showKeys.openai ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSave("openai")} 
                className="flex-1"
                disabled={saving.openai || loading}
              >
                {saving.openai ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Token OpenAI"
                )}
              </Button>
              {apiKeys.openai && (
                <Button 
                  onClick={() => handleRemove("openai")} 
                  variant="outline"
                  size="icon"
                  disabled={saving.openai || loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remover token OpenAI"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google Gemini */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Google Gemini API
                </CardTitle>
                <CardDescription>
                  Configure sua chave de API do Google Gemini
                </CardDescription>
              </div>
              {isConfigured(apiKeys.gemini) ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                  <Check className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Não configurado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gemini-key">Token da API</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="gemini-key"
                  type={showKeys.gemini ? "text" : "password"}
                  placeholder="AIza..."
                  value={apiKeys.gemini}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                />
                <Button
                  variant="outline"
                  onClick={() => handleToggleVisibility("gemini")}
                >
                  {showKeys.gemini ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSave("gemini")} 
                className="flex-1"
                disabled={saving.gemini || loading}
              >
                {saving.gemini ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Token Gemini"
                )}
              </Button>
              {apiKeys.gemini && (
                <Button 
                  onClick={() => handleRemove("gemini")} 
                  variant="outline"
                  size="icon"
                  disabled={saving.gemini || loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remover token Gemini"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Claude Sonnet */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Claude Sonnet API
                </CardTitle>
                <CardDescription>
                  Configure sua chave de API do Anthropic Claude
                </CardDescription>
              </div>
              {isConfigured(apiKeys.claude) ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                  <Check className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Não configurado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="claude-key">Token da API</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="claude-key"
                  type={showKeys.claude ? "text" : "password"}
                  placeholder="sk-ant-..."
                  value={apiKeys.claude}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, claude: e.target.value }))}
                />
                <Button
                  variant="outline"
                  onClick={() => handleToggleVisibility("claude")}
                >
                  {showKeys.claude ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSave("claude")} 
                className="flex-1"
                disabled={saving.claude || loading}
              >
                {saving.claude ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Token Claude"
                )}
              </Button>
              {apiKeys.claude && (
                <Button 
                  onClick={() => handleRemove("claude")} 
                  variant="outline"
                  size="icon"
                  disabled={saving.claude || loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remover token Claude"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Modo de Operação</CardTitle>
            <CardDescription>
              Quando múltiplos tokens estão configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quando todas as 3 IAs estiverem configuradas, o sistema poderá usar as três em conjunto 
              para criar páginas ainda mais incríveis, similar ao Lovable. Cada IA contribuirá com suas 
              especialidades para entregar o melhor resultado.
            </p>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}
