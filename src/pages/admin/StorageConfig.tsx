import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StorageConfig {
  id: string;
  provider: string;
  uploadUrl: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PROVIDERS = [
  { value: 'wasabi', label: 'Wasabi' },
  { value: 'aws', label: 'Amazon S3' },
  { value: 'digitalocean', label: 'DigitalOcean Spaces' },
  { value: 'minio', label: 'MinIO' },
  { value: 'other', label: 'Outro' },
];

export default function StorageConfig() {
  const [configs, setConfigs] = useState<StorageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);

  const [formData, setFormData] = useState({
    provider: '',
    uploadUrl: '',
    endpoint: '',
    accessKey: '',
    secretKey: '',
    bucketName: '',
    region: '',
    isActive: false,
  });

  // Carregar configurações
  const loadConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/storage/config', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setConfigs(data.data);
      } else {
        toast.error('Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // Salvar configuração
  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId ? `http://localhost:3001/api/storage/config/${editingId}` : 'http://localhost:3001/api/storage/config';
      const method = editingId ? 'PUT' : 'POST';

      console.log('🔧 Salvando configuração:', { url, method, formData });

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData),
      });

      console.log('🔧 Response status:', response.status);
      console.log('🔧 Response headers:', response.headers);

      const data = await response.json();
      console.log('🔧 Response data:', data);

      if (data.success) {
        toast.success(data.message);
        setShowForm(false);
        setEditingId(null);
        resetForm();
        loadConfigs();
      } else {
        console.error('❌ Erro na resposta:', data);
        toast.error(data.error || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  // Testar conexão
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/storage/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message,
        error: data.error,
      });

      if (data.success) {
        toast.success('Conexão testada com sucesso!');
      } else {
        toast.error(`Falha na conexão: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error('Erro ao testar conexão');
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão',
        error: 'Erro interno',
      });
    } finally {
      setTesting(false);
    }
  };

  // Editar configuração
  const handleEdit = (config: StorageConfig) => {
    setFormData({
      provider: config.provider,
      uploadUrl: config.uploadUrl,
      endpoint: config.endpoint,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      bucketName: config.bucketName,
      region: config.region,
      isActive: config.isActive,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  // Deletar configuração
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta configuração?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/storage/config/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Configuração deletada com sucesso');
        loadConfigs();
      } else {
        toast.error(data.error || 'Erro ao deletar configuração');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar configuração');
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      provider: '',
      uploadUrl: '',
      endpoint: '',
      accessKey: '',
      secretKey: '',
      bucketName: '',
      region: '',
      isActive: false,
    });
    setEditingId(null);
    setTestResult(null);
  };

  // Cancelar edição
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Storage</h1>
          <p className="text-muted-foreground">
            Configure o armazenamento de arquivos (S3, Wasabi, etc.)
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Configuração' : 'Nova Configuração'}
            </CardTitle>
            <CardDescription>
              Configure as credenciais do seu provedor de storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provedor</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uploadUrl">URL de Uploads</Label>
                <Input
                  id="uploadUrl"
                  placeholder="https://s3.wasabisys.com"
                  value={formData.uploadUrl}
                  onChange={(e) => setFormData({ ...formData, uploadUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="https://s3.wasabisys.com"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <Input
                  id="region"
                  placeholder="us-east-1"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bucketName">Nome do Bucket</Label>
                <Input
                  id="bucketName"
                  placeholder="meu-bucket"
                  value={formData.bucketName}
                  onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessKey">Chave de Acesso</Label>
                <Input
                  id="accessKey"
                  type="password"
                  placeholder="Sua chave de acesso"
                  value={formData.accessKey}
                  onChange={(e) => setFormData({ ...formData, accessKey: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Chave Secreta</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Sua chave secreta"
                  value={formData.secretKey}
                  onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Configuração Ativa</Label>
              </div>
            </div>

            {/* Resultado do teste */}
            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  )}
                  <AlertDescription>
                    {testResult.message}
                    {testResult.error && (
                      <div className="text-sm text-red-600 mt-1">
                        Erro: {testResult.error}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={handleTest} disabled={testing || !formData.provider || !formData.endpoint}>
                {testing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Testar Conexão
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {editingId ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de configurações */}
      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{PROVIDERS.find(p => p.value === config.provider)?.label || config.provider}</h3>
                    {config.isActive && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><strong>Bucket:</strong> {config.bucketName}</div>
                    <div><strong>Região:</strong> {config.region}</div>
                    <div><strong>Endpoint:</strong> {config.endpoint}</div>
                    <div><strong>URL:</strong> {config.uploadUrl}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(config)}
                  >
                    Editar
                  </Button>
                  {!config.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Nenhuma configuração de storage encontrada.
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Configuração
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
