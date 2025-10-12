import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

interface SuggestionForm {
  title: string;
  description: string;
  category: string;
  priority: string;
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

export default function Sugestoes() {
  const [form, setForm] = useState<SuggestionForm>({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Enviando dados:', form);
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log('📥 Resposta recebida:', { status: response.status, data });

      if (response.ok) {
        setIsSubmitted(true);
        setForm({
          title: '',
          description: '',
          category: '',
          priority: 'MEDIUM',
        });
        toast({
          title: 'Sucesso!',
          description: 'Sua sugestão foi enviada com sucesso. Obrigado pelo feedback!',
        });
      } else {
        console.error('❌ Erro na API:', data);
        throw new Error(data.error || data.details || 'Erro ao enviar sugestão');
      }
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar sugestão. Tente novamente.';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SuggestionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Sugestão Enviada!</CardTitle>
            <CardDescription>
              Obrigado pelo seu feedback! Sua sugestão foi recebida e será analisada pela nossa equipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Enviar Nova Sugestão
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sugestões</h1>
            <p className="text-muted-foreground">
              Compartilhe suas ideias e ajude-nos a melhorar a plataforma
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Sugestão</CardTitle>
          <CardDescription>
            Sua opinião é muito importante para nós. Descreva sua sugestão de melhoria ou funcionalidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Adicionar modo escuro"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-sm text-muted-foreground">
                {form.title.length}/200 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={form.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={form.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva sua sugestão em detalhes. Quanto mais informações, melhor poderemos entender sua necessidade."
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                maxLength={2000}
                required
              />
              <p className="text-sm text-muted-foreground">
                {form.description.length}/2000 caracteres
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Sugestão
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <strong>Dica:</strong> Seja específico em sua descrição. Inclua exemplos, 
              casos de uso ou screenshots se possível. Isso nos ajuda a entender 
              melhor sua sugestão e implementá-la mais rapidamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
