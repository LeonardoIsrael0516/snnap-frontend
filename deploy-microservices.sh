#!/bin/bash

# Script de deploy para o sistema com microserviços
echo "🚀 Iniciando deploy do sistema com microserviços..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se o comando foi executado com sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ Erro em: $1${NC}"
        exit 1
    fi
}

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando a partir do .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Por favor, edite o arquivo .env com suas configurações antes de continuar.${NC}"
        exit 1
    else
        echo -e "${RED}❌ Arquivo .env.example não encontrado.${NC}"
        exit 1
    fi
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down
check_success "Parada dos containers"

# Remover imagens antigas (opcional)
echo "🧹 Removendo imagens antigas..."
docker system prune -f
check_success "Limpeza do sistema"

# Build das imagens
echo "🔨 Construindo imagens Docker..."

# Backend principal
echo "📦 Construindo backend principal..."
docker-compose build backend
check_success "Build do backend principal"

# Microserviço Link AI
echo "🤖 Construindo microserviço Link AI..."
docker-compose build link-ai
check_success "Build do microserviço Link AI"

# Frontend
echo "🎨 Construindo frontend..."
docker-compose build frontend
check_success "Build do frontend"

# Iniciar banco de dados
echo "🗄️ Iniciando bancos de dados..."
docker-compose up -d postgres postgres-ai
check_success "Inicialização dos bancos de dados"

# Aguardar bancos estarem prontos
echo "⏳ Aguardando bancos de dados estarem prontos..."
sleep 10

# Executar migrações do backend principal
echo "🔄 Executando migrações do backend principal..."
docker-compose exec -T backend npx prisma migrate deploy
check_success "Migrações do backend principal"

# Executar migrações do microserviço Link AI
echo "🔄 Executando migrações do microserviço Link AI..."
docker-compose exec -T link-ai npx prisma db push
check_success "Migrações do microserviço Link AI"

# Iniciar todos os serviços
echo "🚀 Iniciando todos os serviços..."
docker-compose up -d
check_success "Inicialização dos serviços"

# Aguardar serviços estarem prontos
echo "⏳ Aguardando serviços estarem prontos..."
sleep 15

# Verificar status dos serviços
echo "🔍 Verificando status dos serviços..."

# Backend principal
echo "📡 Verificando backend principal..."
if curl -f http://localhost:3001/api/auth/signin > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend principal funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  Backend principal pode não estar funcionando corretamente${NC}"
fi

# Microserviço Link AI
echo "🤖 Verificando microserviço Link AI..."
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Microserviço Link AI funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  Microserviço Link AI pode não estar funcionando corretamente${NC}"
fi

# Frontend
echo "🎨 Verificando frontend..."
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend pode não estar funcionando corretamente${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo "📋 Serviços disponíveis:"
echo "  🌐 Frontend: http://localhost:8080"
echo "  🔧 Backend Principal: http://localhost:3001"
echo "  🤖 Microserviço Link AI: http://localhost:3002"
echo "  🗄️  Banco Principal: localhost:5432"
echo "  🗄️  Banco Link AI: localhost:5433"
echo ""
echo "📊 Health Checks:"
echo "  🔧 Backend: http://localhost:3001/api/auth/signin"
echo "  🤖 Link AI: http://localhost:3002/health"
echo ""
echo "📝 Logs dos serviços:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f link-ai"
echo "  docker-compose logs -f frontend"
echo ""
echo -e "${YELLOW}💡 Dica: Configure suas chaves de API no arquivo .env para usar as funcionalidades de IA${NC}"







