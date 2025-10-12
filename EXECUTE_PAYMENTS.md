# 🚀 Executar Microserviço de Pagamentos Efí

## 📋 Status da Implementação

✅ **CONCLUÍDO:**
- Microserviço de pagamentos completo
- Integração com Efí (Pix + Cartão)
- Webhooks para notificações
- Integração com banco principal (créditos + planos)
- Job de renovação automática de assinaturas
- Componentes frontend (CheckoutModal, PixCheckout, CardCheckout)
- Histórico de pagamentos
- Painel administrativo
- Docker Compose e Nginx configurados
- Documentação completa

## 🎯 Próximos Passos para Execução

### 1. Configurar Credenciais Efí

```bash
# Navegar para o microserviço
cd microservices/payments

# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env
```

**Configurar no .env:**
```env
# Credenciais Efí (SANDBOX para testes)
EFI_SANDBOX=true
EFI_CLIENT_ID="Client_Id_sandbox_aqui"
EFI_CLIENT_SECRET="Client_Secret_sandbox_aqui"
EFI_PIX_KEY="sua-chave-pix@email.com"

# JWT (mesmo do backend principal)
JWT_SECRET="your-jwt-secret-key-here"
```

### 2. Instalar Dependências

```bash
# Instalar dependências do microserviço
npm install

# Gerar Prisma Client
npm run db:generate
```

### 3. Configurar Banco de Dados

```bash
# Executar migrações
npm run db:migrate

# Ou usar push para desenvolvimento
npm run db:push
```

### 4. Iniciar Serviços

#### Opção A: Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d payments postgres-payments

# Verificar se está rodando
docker ps | grep payments
```

#### Opção B: Desenvolvimento Local

```bash
# Terminal 1: Banco de dados
docker run -d --name postgres-payments \
  -e POSTGRES_DB=payments \
  -e POSTGRES_USER=payments_user \
  -e POSTGRES_PASSWORD=payments_pass \
  -p 5435:5432 postgres:15

# Terminal 2: Redis
docker run -d --name redis \
  -p 6379:6379 redis:7-alpine

# Terminal 3: Microserviço
cd microservices/payments
npm run dev
```

### 5. Verificar Funcionamento

```bash
# Health check
curl http://localhost:3004/health

# Teste de webhook
curl http://localhost:3004/webhooks/efi/test

# Executar suite de testes
node test-payments.js
```

### 6. Configurar Frontend

Adicionar ao seu componente de planos/pagamentos:

```tsx
import { CheckoutModal } from '@/components/CheckoutModal';
import { PaymentHistory } from '@/components/PaymentHistory';
import { AdminPaymentDashboard } from '@/components/AdminPaymentDashboard';

// Exemplo de uso
function PlansPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <>
      {/* Seus planos existentes */}
      <Button onClick={() => {
        setSelectedPlan(plan);
        setCheckoutOpen(true);
      }}>
        Assinar Plano
      </Button>

      {/* Modal de checkout */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        type="plan"
        referenceId={selectedPlan?.id}
        amount={selectedPlan?.price}
        description={selectedPlan?.description}
        onSuccess={() => {
          console.log('Pagamento realizado!');
          // Atualizar estado do usuário
        }}
      />

      {/* Histórico de pagamentos */}
      <PaymentHistory userId={user.id} />

      {/* Painel admin (apenas para admins) */}
      {user.role === 'ADMIN' && (
        <AdminPaymentDashboard isAdmin={true} />
      )}
    </>
  );
}
```

## 🧪 Testes

### 1. Teste Básico

```bash
# Verificar se está funcionando
curl http://localhost:3004/health
```

### 2. Teste de Pix

```bash
curl -X POST http://localhost:3004/api/pix/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "amount": 10.00,
    "type": "CREDIT_PACKAGE",
    "referenceId": "test_package_100"
  }'
```

### 3. Teste Completo

```bash
# Executar todos os testes
node test-payments.js
```

## 🔧 Configuração de Produção

### 1. Credenciais de Produção

```env
# Produção
EFI_SANDBOX=false
EFI_CLIENT_ID="Client_Id_producao"
EFI_CLIENT_SECRET="Client_Secret_producao"
EFI_PIX_KEY="sua-chave-pix-producao@email.com"
```

### 2. Certificados

```bash
# Colocar certificado de produção
cp certificado_producao.p12 microservices/payments/certificates/producao.p12
```

### 3. Webhooks

Configure no painel Efí:
- **URL**: `https://seudominio.com/webhooks/efi`
- **Eventos**: Pix, Cartão, Assinatura

## 📊 Monitoramento

### Logs

```bash
# Docker
docker logs -f meulink_payments

# Local
npm run dev
```

### Métricas

```bash
# Métricas do microserviço
curl http://localhost:3004/metrics

# Health check
curl http://localhost:3004/health
```

### Admin Dashboard

Acesse o painel admin em:
- **Estatísticas**: `GET /api/admin/renewal/stats`
- **Assinaturas**: `GET /api/admin/renewal/expiring`
- **Verificação manual**: `POST /api/admin/renewal/check`

## 🐛 Troubleshooting

### Erro: "EFI_CLIENT_ID é obrigatório"

**Solução:** Verifique se as credenciais estão configuradas no .env

### Erro: "Database connection failed"

**Solução:** Verifique se o PostgreSQL está rodando e as credenciais estão corretas

### Erro: "Token não fornecido"

**Solução:** Use o mesmo JWT_SECRET do backend principal

### Erro: "Efí service error"

**Solução:** Verifique as credenciais Efí e se o certificado está no lugar correto

## 📚 Documentação

- **README do microserviço**: `microservices/payments/README.md`
- **Setup de pagamentos**: `PAYMENT_SETUP.md`
- **Configuração sandbox**: `microservices/payments/SANDBOX_SETUP.md`
- **Documentação Efí**: https://dev.efipay.com.br/docs/

## 🎉 Pronto!

O microserviço de pagamentos está completamente implementado e pronto para uso. Siga os passos acima para configurar e executar.

**Funcionalidades disponíveis:**
- ✅ Pix instantâneo com QR Code
- ✅ Pagamento com cartão de crédito
- ✅ Assinaturas recorrentes
- ✅ Webhooks em tempo real
- ✅ Integração com sistema de créditos
- ✅ Ativação automática de planos
- ✅ Renovação automática de assinaturas
- ✅ Histórico de pagamentos
- ✅ Painel administrativo
- ✅ Monitoramento e métricas

**Próximo passo:** Configure suas credenciais Efí e teste o sistema!
