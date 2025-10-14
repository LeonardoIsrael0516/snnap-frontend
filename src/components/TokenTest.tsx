import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePaymentToken } from '@/lib/efi-sdk';

export default function TokenTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testTokenGeneration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

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

      console.log('🧪 Testando geração de token...');
      console.log('📝 Dados do cartão:', cardData);

      const token = await generatePaymentToken(cardData);
      
      console.log('✅ Token gerado:', token);
      
      setResult({
        success: true,
        token,
        cardData,
        tokenLength: token.length,
        tokenFormat: /^[a-fA-F0-9]{40}$/.test(token) ? 'Válido (40 hex)' : 'Inválido'
      });
    } catch (error: any) {
      console.error('❌ Erro ao gerar token:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Geração de Token Efí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testTokenGeneration} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Gerando Token...' : 'Testar Geração de Token'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800">Erro:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Resultado:</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Token:</strong> {result.token}</p>
              <p><strong>Comprimento:</strong> {result.tokenLength} caracteres</p>
              <p><strong>Formato:</strong> {result.tokenFormat}</p>
              <p><strong>Dados do Cartão:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(result.cardData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

