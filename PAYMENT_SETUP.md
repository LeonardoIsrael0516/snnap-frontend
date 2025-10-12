# 🚀 Configuração do Gateway de Pagamento Efí

Este guia explica como configurar e executar o microserviço de pagamentos Efí na plataforma MeuLink.

## 📋 Pré-requisitos

### 1. Credenciais Efí

Você precisa ter uma conta na Efí e obter:

- **Client ID** e **Client Secret**
- **Chave Pix** da conta
- **Certificado .p12** (para produção)

### 2. Ambiente de Desenvolvimento

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL
- Redis

## 🛠️ Instalação

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp microservices/payments/.env.example microservices/payments/.env

# Editar com suas credenciais
nano microservices/payments/.env
```

**Exemplo de configuração:**

```env
# Porta do microserviço
PORT=3004

# Banco de dados
DATABASE_URL="postgresql://payments_user:payments_pass@localhost:5435/payments"
MAIN_DATABASE_URL="postgresql://meulink_user:meulink_password@localhost:5432/meulink"

# JWT (mesmo do backend principal)
JWT_SECRET="your-jwt-secret-key-here"

# Redis
REDIS_URL="redis://localhost:6379"

# Credenciais Efí (SANDBOX para testes)
EFI_SANDBOX=true
EFI_CLIENT_ID="Client_Id_sandbox_aqui"
EFI_CLIENT_SECRET="Client_Secret_sandbox_aqui"
EFI_PIX_KEY="sua-chave-pix@email.com"

# URLs permitidas
ALLOWED_ORIGINS="http://localhost:8080,http://localhost:3000"
```

### 2. Instalar Dependências

```bash
cd microservices/payments
npm install
```

### 3. Configurar Banco de Dados

```bash
# Gerar Prisma Client
npm run db:generate

# Executar migrações
npm run db:migrate
```

### 4. Configurar Certificados (Produção)

```bash
# Colocar certificado .p12 na pasta certificates/
cp /caminho/para/certificado.p12 microservices/payments/certificates/producao.p12
```

## 🚀 Execução

### Opção 1: Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d payments postgres-payments
```

### Opção 2: Desenvolvimento Local

```bash
cd microservices/payments
npm run dev
```

### Opção 3: Produção

```bash
cd microservices/payments
npm run build
npm start
```

## 🧪 Testes

### 1. Verificar Saúde do Serviço

```bash
curl http://localhost:3004/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "efí": {
      "status": "healthy",
      "message": "Efí service is working"
    }
  }
}
```

### 2. Testar Criação de Pix

```bash
curl -X POST http://localhost:3004/api/pix/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "amount": 10.00,
    "type": "CREDIT_PACKAGE",
    "referenceId": "package_123"
  }'
```

### 3. Testar Webhook

```bash
curl -X GET http://localhost:3004/webhooks/efi/test
```

## 🔧 Configuração Efí

### 1. Sandbox (Desenvolvimento)

Para testes, use o ambiente sandbox:

```env
EFI_SANDBOX=true
EFI_CLIENT_ID="Client_Id_sandbox"
EFI_CLIENT_SECRET="Client_Secret_sandbox"
```

### 2. Produção

Para produção, configure:

```env
EFI_SANDBOX=false
EFI_CLIENT_ID="Client_Id_producao"
EFI_CLIENT_SECRET="Client_Secret_producao"
```

### 3. Webhooks

Configure no painel Efí:
- **URL**: `https://seudominio.com/webhooks/efi`
- **Eventos**: Pix, Cartão, Assinatura

## 🎯 Uso no Frontend

### 1. Importar Componentes

```tsx
import { CheckoutModal } from '@/components/CheckoutModal';
import { PaymentExample } from '@/components/PaymentExample';
```

### 2. Exemplo de Uso

```tsx
function MyComponent() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setCheckoutOpen(true)}>
        Comprar Créditos
      </Button>
      
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        type="package"
        referenceId="credits_100"
        amount={19.90}
        description="100 Créditos - Para testar a plataforma"
        onSuccess={() => {
          console.log('Pagamento realizado!');
          // Atualizar estado do usuário
        }}
      />
    </>
  );
}
```

## 📊 Monitoramento

### 1. Logs

```bash
# Docker
docker logs meulink_payments

# Desenvolvimento
npm run dev
```

### 2. Métricas

```bash
curl http://localhost:3004/metrics
```

### 3. Health Check

```bash
curl http://localhost:3004/health
```

## 🐛 Troubleshooting

### Erro: "EFI_CLIENT_ID é obrigatório"

**Solução:** Verifique se as variáveis de ambiente estão configuradas:

```bash
echo $EFI_CLIENT_ID
echo $EFI_CLIENT_SECRET
```

### Erro: "Token não fornecido"

**Solução:** Verifique se o JWT_SECRET está configurado e é o mesmo do backend principal.

### Erro: "Database connection failed"

**Solução:** Verifique se o PostgreSQL está rodando e as credenciais estão corretas:

```bash
# Verificar se o banco está rodando
docker ps | grep postgres

# Testar conexão
psql "postgresql://payments_user:payments_pass@localhost:5435/payments"
```

### Erro: "Efí service error"

**Solução:** Verifique as credenciais Efí e se o certificado está no lugar correto:

```bash
# Verificar certificado
ls -la microservices/payments/certificates/

# Verificar credenciais
echo $EFI_SANDBOX
echo $EFI_CLIENT_ID
```

## 🔒 Segurança

### 1. Certificados

- Mantenha certificados .p12 seguros
- Não commite certificados no Git
- Use variáveis de ambiente para credenciais

### 2. Webhooks

- Valide assinaturas dos webhooks
- Use HTTPS em produção
- Implemente rate limiting

### 3. JWT

- Use o mesmo JWT_SECRET do backend principal
- Valide tokens em todas as rotas protegidas

## 📚 Próximos Passos

1. **Configurar credenciais Efí** (sandbox ou produção)
2. **Testar fluxo completo** de pagamento
3. **Configurar webhooks** no painel Efí
4. **Integrar com sistema de créditos** do backend principal
5. **Implementar renovação automática** de assinaturas
6. **Adicionar histórico de pagamentos** no frontend
7. **Criar painel admin** para gerenciar pagamentos

## 🆘 Suporte

- **Documentação Efí**: https://dev.efipay.com.br/docs/
- **SDK Node.js**: https://dev.efipay.com.br/docs/sdk/node/
- **Issues**: Abra uma issue no repositório do projeto

---

**✅ Implementação concluída!** O microserviço de pagamentos está pronto para uso.
