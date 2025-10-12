# frontend

Frontend da plataforma Snnap - React + Vite com interface moderna

## 🚀 Deploy no Render

### Configuração
- **Tipo**: Web Service
- **Root Directory**: frontend
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: 8080

### Variáveis de Ambiente

Consulte o arquivo `env.production` para as variáveis necessárias.

### URLs de Produção
- **Serviço**: https://snnap-frontend.onrender.com
- **Health Check**: https://snnap-frontend.onrender.com/health

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Banco de dados
npm run db:generate
npm run db:push
npm run db:migrate
```

## 🔧 Desenvolvimento Local

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

3. Execute as migrações do banco:
```bash
npm run db:push
```

4. Inicie o servidor:
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/                 # Código fonte
├── prisma/             # Schema e migrações do banco
├── dist/               # Build de produção
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configuração TypeScript
└── README.md          # Este arquivo
```
