# Configuração das Variáveis de Ambiente Efí

## Problema Atual
O erro 401 (Unauthorized) indica que o `VITE_EFI_ACCOUNT_CODE` não está configurado corretamente.

## Solução

### 1. Criar arquivo `.env` no frontend
Crie um arquivo `.env` na pasta `frontend/` com o seguinte conteúdo:

```env
# Efí Payment Gateway Configuration
VITE_EFI_ACCOUNT_CODE=seu-codigo-da-conta-efi-aqui
VITE_EFI_SANDBOX=true

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:8081
```

### 2. Obter o Código da Conta Efí
1. Acesse o painel da Efí
2. Vá em "Configurações" ou "Integração"
3. Procure por "Account Code" ou "Código da Conta"
4. Copie o código e substitua `seu-codigo-da-conta-efi-aqui`

### 3. Reiniciar o Frontend
Após criar o arquivo `.env`, reinicie o servidor de desenvolvimento:

```bash
cd frontend
npm run dev
```

### 4. Verificar se Funcionou
- O erro 401 deve desaparecer
- O token deve ser gerado corretamente
- O pagamento deve funcionar

## Nota Importante
O código `9892f8deff68bec71e66bd65c2661f5a` que estava sendo usado como fallback não é válido para sandbox da Efí. Você precisa usar o código real da sua conta.

