import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function PaymentTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPayment = async () => {
    setLoading(true);
    try {
      console.log('VITE_PAYMENTS_API_URL:', import.meta.env.VITE_PAYMENTS_API_URL);
      
      const response = await fetch(`${import.meta.env.VITE_PAYMENTS_API_URL}/card/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWducGdnbzUwMDA0MTBudnltb3NoaW54IiwiZW1haWwiOiJ0ZXN0ZUBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzYwMjkzMDE1LCJleHAiOjE3NjAzNzk0MTV9.pIkmkj4HWrzo1e4Sv8PzAqL16KW8aC_I9Hubt-6yU0A'
        },
        body: JSON.stringify({
          amount: 10.00,
          type: 'CREDIT_PACKAGE',
          referenceId: 'cmgnwm6rk002o10nv2qzieert',
          description: 'Pacote de Créditos - R$ 10.00',
          cardData: {
            paymentToken: 'test1234567890123456789012345678901234567890',
            customer: {
              name: 'Teste Usuário',
              email: 'teste@example.com',
              cpf: '02629008231',
              birth: '1990-01-01',
              phone_number: '11999999999'
            },
            billingAddress: {
              street: 'Rua Exemplo',
              number: '123',
              neighborhood: 'Centro',
              zipcode: '01234567',
              city: 'São Paulo',
              state: 'SP'
            }
          }
        })
      });

      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Teste de Pagamento</h3>
      <p className="text-sm text-gray-600 mb-4">
        URL: {import.meta.env.VITE_PAYMENTS_API_URL || 'NÃO DEFINIDA'}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Todas as variáveis: {JSON.stringify(import.meta.env, null, 2)}
      </p>
      <Button onClick={testPayment} disabled={loading}>
        {loading ? 'Testando...' : 'Testar Pagamento'}
      </Button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
