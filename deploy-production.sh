#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO
# ===========================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy para produção..."

# ===========================================
# CONFIGURAÇÕES
# ===========================================

# Domínio principal
DOMAIN="seudominio.com"
API_DOMAIN="api.seudominio.com"
PAYMENTS_DOMAIN="payments.seudominio.com"
LINK_AI_DOMAIN="link-ai.seudominio.com"
BIOLINK_DOMAIN="biolink.seudominio.com"

# Diretórios
PROJECT_ROOT="/home/leonardo/Documentos/meulink"
FRONTEND_DIR="$PROJECT_ROOT"
BACKEND_DIR="$PROJECT_ROOT/backend"
PAYMENTS_DIR="$PROJECT_ROOT/microservices/payments"
LINK_AI_DIR="$PROJECT_ROOT/microservices/link-ai"
BIOLINK_DIR="$PROJECT_ROOT/microservices/biolink"

# ===========================================
# FUNÇÕES AUXILIARES
# ===========================================

log() {
    echo "📝 $1"
}

error() {
    echo "❌ $1"
    exit 1
}

success() {
    echo "✅ $1"
}

# ===========================================
# VERIFICAÇÕES PRÉ-DEPLOY
# ===========================================

log "Verificando pré-requisitos..."

# Verificar se os diretórios existem
for dir in "$FRONTEND_DIR" "$BACKEND_DIR" "$PAYMENTS_DIR" "$LINK_AI_DIR" "$BIOLINK_DIR"; do
    if [ ! -d "$dir" ]; then
        error "Diretório não encontrado: $dir"
    fi
done

# Verificar se os arquivos de configuração existem
if [ ! -f "$PAYMENTS_DIR/env.production.example" ]; then
    error "Arquivo de configuração de produção não encontrado: $PAYMENTS_DIR/env.production.example"
fi

# ===========================================
# BACKUP
# ===========================================

log "Criando backup do sistema atual..."
BACKUP_DIR="/tmp/meulink-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup dos arquivos de configuração
cp -r "$PROJECT_ROOT"/*.env* "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$PAYMENTS_DIR"/*.env* "$BACKUP_DIR/" 2>/dev/null || true

success "Backup criado em: $BACKUP_DIR"

# ===========================================
# CONFIGURAÇÃO DOS MICROSERVIÇOS
# ===========================================

log "Configurando microserviços para produção..."

# Microserviço de Pagamentos
log "Configurando microserviço de pagamentos..."
cd "$PAYMENTS_DIR"

# Copiar configuração de produção
if [ -f "env.production.example" ]; then
    cp env.production.example .env.production
    log "Arquivo .env.production criado. ATENÇÃO: Configure as variáveis antes de continuar!"
fi

# Instalar dependências
npm ci --production

# ===========================================
# BUILD DO FRONTEND
# ===========================================

log "Fazendo build do frontend..."
cd "$FRONTEND_DIR"

# Instalar dependências
npm ci

# Build para produção
npm run build

success "Build do frontend concluído"

# ===========================================
# CONFIGURAÇÃO DO NGINX
# ===========================================

log "Configurando Nginx..."

# Criar configuração do Nginx
cat > /tmp/nginx-meulink.conf << EOF
# ===========================================
# CONFIGURAÇÃO NGINX PARA PRODUÇÃO
# ===========================================

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=payments:10m rate=5r/s;

# Upstream para microserviços
upstream backend {
    server localhost:3001;
}

upstream payments {
    server localhost:3004;
}

upstream link_ai {
    server localhost:3002;
}

upstream biolink {
    server localhost:3003;
}

# Servidor principal
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Certificados SSL (configurar com Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend (React)
    location / {
        root $FRONTEND_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Principal
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Servidor para API
server {
    listen 443 ssl http2;
    server_name $API_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    location / {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Servidor para Pagamentos
server {
    listen 443 ssl http2;
    server_name $PAYMENTS_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    location / {
        limit_req zone=payments burst=10 nodelay;
        proxy_pass http://payments;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Servidor para Link AI
server {
    listen 443 ssl http2;
    server_name $LINK_AI_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    location / {
        proxy_pass http://link_ai;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Servidor para Biolink
server {
    listen 443 ssl http2;
    server_name $BIOLINK_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    location / {
        proxy_pass http://biolink;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

log "Configuração do Nginx criada em: /tmp/nginx-meulink.conf"
log "ATENÇÃO: Copie este arquivo para /etc/nginx/sites-available/ e configure os certificados SSL"

# ===========================================
# SCRIPT DE INICIALIZAÇÃO
# ===========================================

log "Criando script de inicialização..."

cat > /tmp/start-production.sh << EOF
#!/bin/bash

# ===========================================
# SCRIPT DE INICIALIZAÇÃO PARA PRODUÇÃO
# ===========================================

echo "🚀 Iniciando serviços de produção..."

# Função para iniciar serviço
start_service() {
    local name=\$1
    local dir=\$2
    local port=\$3
    
    echo "Iniciando \$name..."
    cd "\$dir"
    
    # Verificar se já está rodando
    if pgrep -f "\$name" > /dev/null; then
        echo "⚠️ \$name já está rodando"
        return
    fi
    
    # Iniciar serviço
    if [ -f "package.json" ]; then
        npm start &
    else
        echo "❌ package.json não encontrado em \$dir"
        return
    fi
    
    # Aguardar serviço ficar disponível
    for i in {1..30}; do
        if curl -s http://localhost:\$port/health > /dev/null 2>&1; then
            echo "✅ \$name iniciado com sucesso"
            return
        fi
        sleep 1
    done
    
    echo "❌ Falha ao iniciar \$name"
}

# Iniciar microserviços
start_service "backend" "$BACKEND_DIR" "3001"
start_service "payments" "$PAYMENTS_DIR" "3004"
start_service "link-ai" "$LINK_AI_DIR" "3002"
start_service "biolink" "$BIOLINK_DIR" "3003"

echo "🎉 Todos os serviços iniciados!"
EOF

chmod +x /tmp/start-production.sh
log "Script de inicialização criado em: /tmp/start-production.sh"

# ===========================================
# SCRIPT DE PARADA
# ===========================================

cat > /tmp/stop-production.sh << EOF
#!/bin/bash

echo "🛑 Parando serviços de produção..."

# Parar todos os serviços
pkill -f "tsx src/index.ts" || true
pkill -f "next start" || true
pkill -f "npm start" || true

echo "✅ Serviços parados"
EOF

chmod +x /tmp/stop-production.sh
log "Script de parada criado em: /tmp/stop-production.sh"

# ===========================================
# INSTRUÇÕES FINAIS
# ===========================================

echo ""
echo "🎉 Deploy preparado com sucesso!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Configure as variáveis de ambiente:"
echo "   - Edite $PAYMENTS_DIR/.env.production"
echo "   - Configure banco de dados, Redis, credenciais Efí"
echo ""
echo "2. Configure o Nginx:"
echo "   - Copie /tmp/nginx-meulink.conf para /etc/nginx/sites-available/"
echo "   - Configure certificados SSL com Let's Encrypt"
echo "   - Reinicie o Nginx"
echo ""
echo "3. Configure DNS:"
echo "   - Aponte $DOMAIN para seu servidor"
echo "   - Configure subdomínios: api, payments, link-ai, biolink"
echo ""
echo "4. Inicie os serviços:"
echo "   - Execute /tmp/start-production.sh"
echo ""
echo "5. Teste o sistema:"
echo "   - Acesse https://$DOMAIN"
echo "   - Teste pagamentos"
echo "   - Verifique logs"
echo ""
echo "📁 Arquivos criados:"
echo "   - $BACKUP_DIR (backup)"
echo "   - /tmp/nginx-meulink.conf (configuração Nginx)"
echo "   - /tmp/start-production.sh (inicialização)"
echo "   - /tmp/stop-production.sh (parada)"
echo ""
echo "⚠️  IMPORTANTE: Configure todas as variáveis de ambiente antes de iniciar!"
