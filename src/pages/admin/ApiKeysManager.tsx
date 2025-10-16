import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Key, Plus, Edit, Trash2, Eye, EyeOff, Check, AlertCircle, Loader2, Settings } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiKey {
  id: string;
  keyName: string;
  apiKey: string;
  isActive: boolean;
  priority: number;
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface GroupedKeys {
  [provider: string]: ApiKey[];
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', color: 'bg-green-100 text-green-800' },
  { value: 'anthropic', label: 'Anthropic Claude', color: 'bg-orange-100 text-orange-800' },
  { value: 'gemini', label: 'Google Gemini', color: 'bg-blue-100 text-blue-800' },
];

export default function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<GroupedKeys>({});
  const [loading, setLoading] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    provider: '',
    keyName: '',
    apiKey: '',
    priority: 1,
    isActive: true,
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/api-keys`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data || {});
      } else {
        toast.error("Erro ao carregar chaves de API");
      }
    } catch (error) {
      console.error('Erro ao carregar chaves:', error);
      toast.error("Erro ao carregar chaves de API");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!formData.provider || !formData.keyName || !formData.apiKey) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/admin/api-keys`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Chave de API criada com sucesso!");
        setIsDialogOpen(false);
        setFormData({ provider: '', keyName: '', apiKey: '', priority: 1, isActive: true });
        loadApiKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar chave");
      }
    } catch (error) {
      console.error('Erro ao criar chave:', error);
      toast.error("Erro ao criar chave de API");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateKey = async () => {
    if (!editingKey) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/admin/api-keys/${editingKey.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          keyName: formData.keyName,
          apiKey: formData.apiKey,
          priority: formData.priority,
          isActive: formData.isActive,
        })
      });

      if (response.ok) {
        toast.success("Chave de API atualizada com sucesso!");
        setEditingKey(null);
        setIsDialogOpen(false);
        setFormData({ provider: '', keyName: '', apiKey: '', priority: 1, isActive: true });
        loadApiKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar chave");
      }
    } catch (error) {
      console.error('Erro ao atualizar chave:', error);
      toast.error("Erro ao atualizar chave de API");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta chave de API?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success("Chave de API deletada com sucesso!");
        loadApiKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao deletar chave");
      }
    } catch (error) {
      console.error('Erro ao deletar chave:', error);
      toast.error("Erro ao deletar chave de API");
    }
  };

  const handleEditKey = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({
      provider: '', // Não editável
      keyName: key.keyName,
      apiKey: key.apiKey,
      priority: key.priority,
      isActive: key.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleToggleVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getProviderInfo = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider) || { label: provider, color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando chaves de API...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Chaves de API</h1>
          <p className="text-muted-foreground">
            Configure múltiplas chaves de API com sistema de fallback automático
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingKey(null);
              setFormData({ provider: '', keyName: '', apiKey: '', priority: 1, isActive: true });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Chave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingKey ? 'Editar Chave de API' : 'Adicionar Nova Chave'}
              </DialogTitle>
              <DialogDescription>
                {editingKey 
                  ? 'Atualize as informações da chave de API'
                  : 'Configure uma nova chave de API com nome personalizado e prioridade'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!editingKey && (
                <div>
                  <Label htmlFor="provider">Provedor</Label>
                  <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="keyName">Nome da Chave</Label>
                <Input
                  id="keyName"
                  placeholder="Ex: OpenAI Principal, Anthropic Backup"
                  value={formData.keyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="apiKey">Chave de API</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-... ou chave da API"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioridade (1 = mais alta)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isActive">Chave ativa</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingKey ? handleUpdateKey : handleCreateKey}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingKey ? 'Atualizar' : 'Criar'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(apiKeys).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Key className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma chave configurada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione chaves de API para OpenAI, Anthropic ou Gemini com sistema de fallback automático
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Chave
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(apiKeys).map(([provider, keys]) => {
            const providerInfo = getProviderInfo(provider);
            return (
              <Card key={provider}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={providerInfo.color}>
                        {providerInfo.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {keys.length} chave{keys.length !== 1 ? 's' : ''} configurada{keys.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingKey(null);
                        setFormData({ provider, keyName: '', apiKey: '', priority: 1, isActive: true });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {keys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{key.keyName}</h4>
                            <Badge variant={key.isActive ? "default" : "secondary"}>
                              {key.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <Badge variant="outline">
                              Prioridade {key.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {showKeys[key.id] ? key.apiKey : `${key.apiKey.substring(0, 8)}...`}
                            </span>
                            {key.lastUsed && (
                              <span>Último uso: {formatDate(key.lastUsed)}</span>
                            )}
                            <span>Usos: {key.usageCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVisibility(key.id)}
                          >
                            {showKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditKey(key)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}



