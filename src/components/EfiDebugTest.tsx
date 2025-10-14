import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testEfiSDKLoading, testTokenGeneration, checkEfiConfig } from '@/lib/efi-sdk-debug';

export default function EfiDebugTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  const addResult = (type: 'info' | 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, { type, message, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testSDKLoading = async () => {
    setLoading(true);
    addResult('info', '🧪 Testando carregamento do SDK...');
    
    try {
      const sdk = await testEfiSDKLoading();
      addResult('success', '✅ SDK carregado com sucesso', sdk);
    } catch (error: any) {
      addResult('error', '❌ Erro ao carregar SDK', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testTokenGen = async () => {
    setLoading(true);
    addResult('info', '🧪 Testando geração de token...');
    
    try {
      const cardData = {
        brand: 'visa',
        number: '4111111111111111',
        cvv: '123',
        expirationMonth: '12',
        expirationYear: '2027',
        name: 'JOAO SILVA',
        cpf: '11144477735'
      };
      
      const token = await testTokenGeneration(cardData);
      addResult('success', '✅ Token gerado com sucesso', token);
    } catch (error: any) {
      addResult('error', '❌ Erro ao gerar token', error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = () => {
    const configData = checkEfiConfig();
    setConfig(configData);
    addResult('info', '🔧 Configuração verificada', configData);
  };

  const clearResults = () => {
    setResults([]);
    setConfig(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Efí SDK</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkConfig} disabled={loading}>
            Verificar Config
          </Button>
          <Button onClick={testSDKLoading} disabled={loading}>
            Testar SDK Loading
          </Button>
          <Button onClick={testTokenGen} disabled={loading}>
            Testar Token Generation
          </Button>
          <Button onClick={clearResults} variant="outline">
            Limpar
          </Button>
        </div>

        {config && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800">Configuração Atual:</h3>
            <pre className="text-sm text-blue-700 mt-2">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                result.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                result.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm">{result.message}</span>
                <span className="text-xs opacity-70">{result.timestamp}</span>
              </div>
              {result.data && (
                <pre className="text-xs mt-2 overflow-auto">
                  {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

