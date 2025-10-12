import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Função para obter headers de autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  topCountries: Array<{ country: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  topOS: Array<{ os: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  topLanguages: Array<{ language: string; count: number }>;
  topUTMSources: Array<{ source: string; count: number }>;
  dailyViews: Array<{ date: string; views: number; unique_visitors: number }>;
  recentViews: Array<{
    country: string;
    city: string;
    device: string;
    os: string;
    browser: string;
    referrerDomain: string;
    createdAt: string;
  }>;
}

const PageAnalytics: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [pageType, setPageType] = useState<'AI_PAGE' | 'BIOLINK' | 'SHORTLINK'>('AI_PAGE');

  // Carregar dados de analytics
  const loadAnalytics = async () => {
    if (!pageId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('pageType', pageType);
      if (dateFrom) params.set('dateFrom', dateFrom.toISOString());
      if (dateTo) params.set('dateTo', dateTo.toISOString());
      
             const response = await fetch(`${import.meta.env.VITE_LINK_AI_API_URL || 'http://localhost:3002/api'}/analytics/stats/${pageId}?${params}`, {
               headers: getAuthHeaders(),
             });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }
      
      const data = await response.json();
      setAnalyticsData(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [pageId, pageType, dateFrom, dateTo]);

  // Função para exportar dados
  const exportData = () => {
    if (!analyticsData) return;
    
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Visualizações', analyticsData.overview.totalViews],
      ['Visitantes Únicos', analyticsData.overview.uniqueVisitors],
      ['Sessões Únicas', analyticsData.overview.uniqueSessions],
      ['Taxa de Rejeição', `${analyticsData.overview.bounceRate}%`],
      ['Duração Média da Sessão', `${analyticsData.overview.avgSessionDuration}s`],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${pageId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadAnalytics}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Nenhum dado encontrado</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Estatísticas da Página</h1>
          <p className="text-sm text-muted-foreground break-all">ID: {pageId}</p>
        </div>
        
        {/* Filtros - Mobile First */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {/* Filtro de Data */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">De:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[140px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Até:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[140px] justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            
            <Button onClick={loadAnalytics} variant="outline" className="flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        {/* Mobile: Grid de abas em 2 linhas */}
        <div className="md:hidden space-y-2">
          <TabsList className="grid grid-cols-2 gap-1 w-full h-auto">
            <TabsTrigger value="overview" className="text-xs py-2">Visão Geral</TabsTrigger>
            <TabsTrigger value="countries" className="text-xs py-2">Países</TabsTrigger>
            <TabsTrigger value="cities" className="text-xs py-2">Cidades</TabsTrigger>
            <TabsTrigger value="devices" className="text-xs py-2">Dispositivos</TabsTrigger>
            <TabsTrigger value="os" className="text-xs py-2">S.O.</TabsTrigger>
            <TabsTrigger value="browsers" className="text-xs py-2">Navegadores</TabsTrigger>
            <TabsTrigger value="referrers" className="text-xs py-2">Referenciadores</TabsTrigger>
            <TabsTrigger value="languages" className="text-xs py-2">Idiomas</TabsTrigger>
            <TabsTrigger value="utms" className="text-xs py-2">UTMs</TabsTrigger>
            <TabsTrigger value="recent" className="text-xs py-2">Últimas</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Desktop: Abas horizontais */}
        <div className="hidden md:block">
          <TabsList className="grid grid-cols-10 w-full">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="countries">Países</TabsTrigger>
            <TabsTrigger value="cities">Cidades</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            <TabsTrigger value="os">S.O.</TabsTrigger>
            <TabsTrigger value="browsers">Navegadores</TabsTrigger>
            <TabsTrigger value="referrers">Referenciadores</TabsTrigger>
            <TabsTrigger value="languages">Idiomas</TabsTrigger>
            <TabsTrigger value="utms">UTMs</TabsTrigger>
            <TabsTrigger value="recent">Últimas</TabsTrigger>
          </TabsList>
        </div>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.uniqueVisitors.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Únicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.uniqueSessions.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.bounceRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analyticsData.overview.avgSessionDuration)}s</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Visitas (simplificado) */}
          <Card>
            <CardHeader>
              <CardTitle>Visitas por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 md:h-64 flex items-end justify-start gap-1 md:gap-2 overflow-x-auto pb-2">
                {analyticsData.dailyViews.slice(0, 30).map((day, index) => {
                  const maxViews = Math.max(...analyticsData.dailyViews.map(d => d.count || d.views || 0));
                  const views = day.count || day.views || 0;
                  return (
                    <div key={index} className="flex flex-col items-center gap-1 md:gap-2 flex-shrink-0 min-w-[16px] md:min-w-[32px]">
                      <div
                        className="bg-primary rounded-t w-2 md:w-8 transition-all hover:bg-primary/80"
                        style={{
                          height: `${maxViews > 0 ? Math.max(4, (views / maxViews) * 100) : 4}px`
                        }}
                        title={`${day.date}: ${views} visualizações`}
                      />
                      <span className="text-[8px] md:text-xs text-muted-foreground">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Países */}
        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Top Países</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.topCountries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de país disponível</p>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {analyticsData.topCountries.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-1 md:gap-2">
                      <span className="font-medium text-xs md:text-base truncate flex-1 min-w-0">{item.country || 'Desconhecido'}</span>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        <div className="w-16 md:w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${analyticsData.topCountries[0]?.count ? (item.count / analyticsData.topCountries[0].count) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground w-6 md:w-12 text-right">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cidades */}
        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>Top Cidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {analyticsData.topCities.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-1 md:gap-2">
                      <span className="font-medium text-xs md:text-base truncate flex-1 min-w-0">{item.city}</span>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        <div className="w-16 md:w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / analyticsData.topCities[0].count) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground w-8 md:w-12 text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dispositivos */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {analyticsData.topDevices.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm md:text-base capitalize truncate flex-1">{item.device}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-20 md:w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(item.count / analyticsData.topDevices[0].count) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground w-6 md:w-12 text-right">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistemas Operacionais */}
        <TabsContent value="os">
          <Card>
            <CardHeader>
              <CardTitle>Sistemas Operacionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {analyticsData.topOS.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-1 md:gap-2">
                    <span className="font-medium text-xs md:text-base truncate flex-1 min-w-0">{item.os}</span>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <div className="w-16 md:w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / analyticsData.topOS[0].count) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground w-8 md:w-12 text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navegadores */}
        <TabsContent value="browsers">
          <Card>
            <CardHeader>
              <CardTitle>Navegadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {analyticsData.topBrowsers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-1 md:gap-2">
                    <span className="font-medium text-xs md:text-base truncate flex-1 min-w-0">{item.browser}</span>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <div className="w-16 md:w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / analyticsData.topBrowsers[0].count) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground w-8 md:w-12 text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referenciadores */}
        <TabsContent value="referrers">
          <Card>
            <CardHeader>
              <CardTitle>Referenciadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {analyticsData.topReferrers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-1 md:gap-2">
                    <span className="font-medium text-xs md:text-base truncate flex-1 min-w-0">{item.referrer}</span>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <div className="w-16 md:w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / analyticsData.topReferrers[0].count) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground w-8 md:w-12 text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Idiomas */}
        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>Idiomas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {analyticsData.topLanguages.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-1 md:gap-2">
                    <span className="font-medium text-xs md:text-base truncate flex-1 min-w-0">{item.language}</span>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <div className="w-16 md:w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / analyticsData.topLanguages[0].count) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground w-8 md:w-12 text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UTMs */}
        <TabsContent value="utms">
          <Card>
            <CardHeader>
              <CardTitle>UTM Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {analyticsData.topUTMSources.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-1 md:gap-2">
                    <span className="font-medium text-xs md:text-base truncate flex-1 min-w-0">{item.source}</span>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <div className="w-16 md:w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / analyticsData.topUTMSources[0].count) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground w-8 md:w-12 text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Últimas Entradas */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">País</th>
                      <th className="text-left p-2">Cidade</th>
                      <th className="text-left p-2">Dispositivo</th>
                      <th className="text-left p-2">SO</th>
                      <th className="text-left p-2">Navegador</th>
                      <th className="text-left p-2">Referenciador</th>
                      <th className="text-left p-2">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recentViews.map((view, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{view.country || '-'}</td>
                        <td className="p-2">{view.city || '-'}</td>
                        <td className="p-2 capitalize">{view.device || '-'}</td>
                        <td className="p-2">{view.os || '-'}</td>
                        <td className="p-2">{view.browser || '-'}</td>
                        <td className="p-2">{view.referrerDomain || '-'}</td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {new Date(view.createdAt).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {analyticsData.recentViews.map((view, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">País:</span>
                        <span className="font-medium">{view.country || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cidade:</span>
                        <span className="font-medium">{view.city || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dispositivo:</span>
                        <span className="font-medium capitalize">{view.device || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SO:</span>
                        <span className="font-medium">{view.os || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Navegador:</span>
                        <span className="font-medium">{view.browser || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referenciador:</span>
                        <span className="font-medium truncate max-w-[150px]">{view.referrerDomain || '-'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium text-xs">
                          {new Date(view.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PageAnalytics;
