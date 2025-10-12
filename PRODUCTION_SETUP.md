# 🚀 Guia de Configuração para Produção

Este guia contém todas as instruções necessárias para configurar o sistema MeuLink em produção.

## 📋 Pré-requisitos

- Servidor Linux (Ubuntu 20.04+ recomendado)
- Docker e Docker Compose
- Nginx
- Certificados SSL (Let's Encrypt)
- Domínio configurado
- Banco de dados PostgreSQL (Supabase ou próprio)
- Redis (Upstash ou próprio)

## 🏗️ Arquitetura de Produção

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx         │    │   Backend       │
│   (React)       │◄───┤   (Reverse      │◄───┤   (Next.js)     │
│   Port: 80/443  │    │    Proxy)       │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ├─── Payments (Port: 3004)
                                ├─── Link AI (Port: 3002)
                                ├─── Biolink (Port: 3003)
                                └─── Redis (Port: 6379)
```

## 🔧 Configuração Passo a Passo

### 1. **Configurar Domínios**

Configure os seguintes domínios no seu DNS:

```
seudominio.com          → IP do servidor
www.seudominio.com      → IP do servidor
api.seudominio.com      → IP do servidor
payments.seudominio.com → IP do servidor
link-ai.seudominio.com  → IP do servidor
biolink.seudominio.com  → IP do servidor
```

### 2. **Configurar Certificados SSL**

```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obter certificados
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
sudo certbot --nginx -d api.seudominio.com
sudo certbot --nginx -d payments.seudominio.com
sudo certbot --nginx -d link-ai.seudominio.com
sudo certbot --nginx -d biolink.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. **Configurar Banco de Dados**

#### Opção A: Supabase (Recomendado)
1. Crie projetos no Supabase para cada microserviço
2. Configure as URLs de conexão
3. Execute as migrações

#### Opção B: PostgreSQL Próprio
```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Criar bancos
sudo -u postgres createdb meulink_main
sudo -u postgres createdb meulink_payments
sudo -u postgres createdb meulink_link_ai
sudo -u postgres createdb meulink_biolink

# Criar usuários
sudo -u postgres createuser meulink_user
sudo -u postgres psql -c "ALTER USER meulink_user PASSWORD 'senha_segura';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE meulink_main TO meulink_user;"
```

### 4. **Configurar Redis**

#### Opção A: Upstash (Recomendado)
1. Crie uma instância no Upstash
2. Configure as credenciais

#### Opção B: Redis Próprio
```bash
# Instalar Redis
sudo apt install redis-server

# Configurar senha
sudo nano /etc/redis/redis.conf
# Adicionar: requirepass sua_senha_redis

# Reiniciar Redis
sudo systemctl restart redis-server
```

### 5. **Configurar Variáveis de Ambiente**

#### Microserviço de Pagamentos
```bash
cd microservices/payments
cp env.production.example .env.production
nano .env.production
```

Configure as seguintes variáveis:
```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@host:porta/banco"
MAIN_DATABASE_URL="postgresql://usuario:senha@host:porta/banco_principal"

# Redis
REDIS_HOST=seu-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=sua_senha_redis

# Efí (Produção)
EFI_SANDBOX=false
EFI_CLIENT_ID="sua_client_id_producao"
EFI_CLIENT_SECRET="sua_client_secret_producao"
EFI_PIX_KEY="sua_chave_pix"
EFI_PAYEE_CODE="seu_payee_code"

# CORS
ALLOWED_ORIGINS="https://seudominio.com,https://www.seudominio.com"
```

#### Frontend
```bash
cp env.production.example .env.production
nano .env.production
```

Configure as seguintes variáveis:
```env
# URLs dos microserviços
VITE_API_URL=https://api.seudominio.com
VITE_PAYMENTS_API_URL=https://payments.seudominio.com/api
VITE_LINK_AI_API_URL=https://link-ai.seudominio.com/api
VITE_BIOLINK_API_URL=https://biolink.seudominio.com/api

# Configurações
NODE_ENV=production
VITE_APP_URL=https://seudominio.com
```

### 6. **Executar Deploy**

```bash
# Tornar o script executável
chmod +x deploy-production.sh

# Executar deploy
./deploy-production.sh
```

### 7. **Configurar Nginx**

```bash
# Copiar configuração
sudo cp /tmp/nginx-meulink.conf /etc/nginx/sites-available/meulink

# Habilitar site
sudo ln -s /etc/nginx/sites-available/meulink /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 8. **Iniciar Serviços**

```bash
# Iniciar todos os serviços
/tmp/start-production.sh

# Ou usar Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

## 🔍 Verificação e Testes

### 1. **Verificar Saúde dos Serviços**

```bash
# Backend
curl https://api.seudominio.com/api/health

# Pagamentos
curl https://payments.seudominio.com/health

# Link AI
curl https://link-ai.seudominio.com/health

# Biolink
curl https://biolink.seudominio.com/health
```

### 2. **Testar Frontend**

1. Acesse https://seudominio.com
2. Teste login/registro
3. Teste criação de páginas
4. Teste sistema de pagamentos

### 3. **Testar Pagamentos**

1. Acesse o modal de pagamento
2. Teste com cartão de teste
3. Verifique se o plano é ativado
4. Verifique logs no microserviço

## 📊 Monitoramento

### 1. **Logs**

```bash
# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs dos microserviços
docker logs meulink-backend
docker logs meulink-payments
docker logs meulink-link-ai
docker logs meulink-biolink
```

### 2. **Métricas**

- Acesse Grafana em https://seudominio.com:3000
- Configure dashboards para monitorar:
  - CPU e memória
  - Requisições por segundo
  - Tempo de resposta
  - Erros

### 3. **Alertas**

Configure alertas para:
- Serviços offline
- Alta utilização de CPU/memória
- Muitos erros 5xx
- Falhas de pagamento

## 🔒 Segurança

### 1. **Firewall**

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3001   # Backend (apenas via Nginx)
sudo ufw deny 3002   # Link AI (apenas via Nginx)
sudo ufw deny 3003   # Biolink (apenas via Nginx)
sudo ufw deny 3004   # Payments (apenas via Nginx)
```

### 2. **Backup**

```bash
# Backup diário dos bancos
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
# Configurar no crontab
```

### 3. **Atualizações**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade

# Atualizar aplicação
git pull origin main
./deploy-production.sh
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **SDK da Efí não carrega**
   - Verificar se o domínio está configurado corretamente
   - Verificar CORS
   - Usar fallback para desenvolvimento

2. **Erro de CORS**
   - Verificar ALLOWED_ORIGINS
   - Verificar configuração do Nginx

3. **Banco de dados não conecta**
   - Verificar URL de conexão
   - Verificar firewall
   - Verificar credenciais

4. **Certificados SSL**
   - Verificar se estão válidos
   - Renovar se necessário
   - Verificar configuração do Nginx

## 📞 Suporte

Para suporte técnico:
- Verificar logs primeiro
- Documentar o problema
- Incluir informações do sistema
- Testar em ambiente de desenvolvimento

## 🔄 Atualizações

Para atualizar o sistema:

1. Fazer backup
2. Parar serviços
3. Atualizar código
4. Executar migrações
5. Reiniciar serviços
6. Testar funcionalidades

---

**⚠️ IMPORTANTE**: Sempre teste em ambiente de desenvolvimento antes de aplicar em produção!
