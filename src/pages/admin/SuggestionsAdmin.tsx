import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const categoryLabels = {
  FEATURE_REQUEST: 'Solicitação de Funcionalidade',
  BUG_REPORT: 'Relatório de Bug',
  UI_UX_IMPROVEMENT: 'Melhoria de Interface',
  PERFORMANCE: 'Performance',
  INTEGRATION: 'Integração',
  OTHER: 'Outro',
};

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const statusLabels = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em Análise',
  APPROVED: 'Aprovada',
  IN_DEVELOPMENT: 'Em Desenvolvimento',
  COMPLETED: 'Concluída',
  REJECTED: 'Rejeitada',
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  IN_DEVELOPMENT: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function SuggestionsAdmin() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    adminNotes: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/suggestions?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        throw new Error('Erro ao carregar sugestões');
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar sugestões.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [statusFilter, categoryFilter]);

  const handleEditSuggestion = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setEditForm({
      status: suggestion.status,
      priority: suggestion.priority,
      adminNotes: suggestion.adminNotes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSuggestion = async () => {
    if (!selectedSuggestion) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/suggestions/${selectedSuggestion.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Sugestão atualizada com sucesso!',
        });
        setIsEditDialogOpen(false);
        fetchSuggestions();
      } else {
        throw new Error('Erro ao atualizar sugestão');
      }
    } catch (error) {
      console.error('Erro ao atualizar sugestão:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar sugestão.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta sugestão?')) return;

    try {
      const response = await fetch(`/api/suggestions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Sugestão deletada com sucesso!',
        });
        fetchSuggestions();
      } else {
        throw new Error('Erro ao deletar sugestão');
      }
    } catch (error) {
      console.error('Erro ao deletar sugestão:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar sugestão.',
        variant: 'destructive',
      });
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Sugestões</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie as sugestões dos usuários
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Buscar por título, descrição ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sugestões */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Carregando sugestões...</p>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma sugestão encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Por {suggestion.user.name} ({suggestion.user.email}) • {formatDate(suggestion.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[suggestion.status as keyof typeof statusColors]}>
                      {statusLabels[suggestion.status as keyof typeof statusLabels]}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[suggestion.priority as keyof typeof priorityColors]}>
                      {priorityLabels[suggestion.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Categoria</Label>
                    <p className="text-sm text-muted-foreground">
                      {categoryLabels[suggestion.category as keyof typeof categoryLabels]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {suggestion.description}
                    </p>
                  </div>
                  {suggestion.adminNotes && (
                    <div>
                      <Label className="text-sm font-medium">Notas do Admin</Label>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {suggestion.adminNotes}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSuggestion(suggestion)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSuggestion(suggestion.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Sugestão</DialogTitle>
            <DialogDescription>
              Atualize o status, prioridade e adicione notas para esta sugestão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSuggestion && (
              <>
                <div>
                  <Label className="text-sm font-medium">Título</Label>
                  <p className="text-sm text-muted-foreground">{selectedSuggestion.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedSuggestion.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Prioridade</Label>
                    <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notas do Admin</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Adicione notas internas sobre esta sugestão..."
                    value={editForm.adminNotes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSuggestion} disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
