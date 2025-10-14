import React, { useState } from 'react';
import { loadEfiTokenSDK, generatePaymentToken } from '../lib/efi-sdk';

export function SdkTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testSdkLoad = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🧪 Testando carregamento do SDK...');
      const sdk = await loadEfiTokenSDK();
      
      if (sdk) {
        setResult('✅ SDK carregado com sucesso!');
        console.log('✅ SDK disponível:', sdk);
      } else {
        setResult('❌ SDK não carregado');
      }
    } catch (error: any) {
      setResult(`❌ Erro: ${error.message}`);
      console.error('❌ Erro ao carregar SDK:', error);
    } finally {
      setLoading(false);
    }
  };

  const testTokenGeneration = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🧪 Testando geração de token...');
      
      const testCardData = {
        number: '4111111111111111',
        cvv: '123',
        expirationMonth: '12',
        expirationYear: '2025',
        brand: 'visa',
        name: 'João Silva', // Nome com pelo menos duas palavras
        cpf: '11144477735' // CPF válido para testes
      };
      
      const token = await generatePaymentToken(testCardData);
      setResult(`✅ Token gerado: ${token}`);
      console.log('✅ Token gerado:', token);
    } catch (error: any) {
      setResult(`❌ Erro: ${error.message}`);
      console.error('❌ Erro ao gerar token:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Teste do SDK Efí</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testSdkLoad}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar SDK'}
          </button>
          
          <button
            onClick={testTokenGeneration}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Token'}
          </button>
        </div>
      </div>
      
      {result && (
        <div className="p-3 bg-white border rounded">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Variáveis de ambiente:</strong></p>
        <p>VITE_EFI_SANDBOX: {import.meta.env.VITE_EFI_SANDBOX}</p>
        <p>VITE_EFI_ACCOUNT_CODE: {import.meta.env.VITE_EFI_ACCOUNT_CODE}</p>
      </div>
    </div>
  );
}
