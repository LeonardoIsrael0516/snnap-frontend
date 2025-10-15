import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EnvDebug() {
  const envVars = {
    VITE_EFI_ACCOUNT_CODE: import.meta.env.VITE_EFI_ACCOUNT_CODE,
    VITE_EFI_SANDBOX: import.meta.env.VITE_EFI_SANDBOX,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug - Variáveis de Ambiente Frontend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono text-sm">{key}:</span>
              <span className="font-mono text-sm text-blue-600">
                {value || <span className="text-red-500">undefined</span>}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800">Instruções:</h3>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>• VITE_EFI_ACCOUNT_CODE deve ter o código da conta Efí</li>
            <li>• VITE_EFI_SANDBOX deve ser 'true' para sandbox</li>
            <li>• Se alguma variável estiver undefined, reinicie o servidor frontend</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}


