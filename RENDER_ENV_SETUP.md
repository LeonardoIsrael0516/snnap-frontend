# 🚨 CONFIGURAÇÃO URGENTE - VARIÁVEIS DE AMBIENTE NO RENDER

## ❌ PROBLEMA ATUAL
O frontend está retornando erro 503 porque as variáveis de ambiente não estão configuradas no painel do Render.

## ✅ SOLUÇÃO

### 1. Acesse o Painel do Render
- URL: https://dashboard.render.com
- Selecione o serviço: `snnap-frontend`

### 2. Configure as Variáveis de Ambiente
Vá em **Environment** e adicione as seguintes variáveis:

```
VITE_API_BASE_URL = https://snnap-backend.onrender.com/api
VITE_LINK_AI_API_URL = https://snnap-link-ai.onrender.com/api
VITE_PAYMENTS_API_URL = https://snnap-payments.onrender.com/api
VITE_BIOLINK_API_URL = https://snnap.com/api
VITE_GOOGLE_CLIENT_ID = 728951604455-kcdkj94g0vp1bmfqgeutf928aen0rd84.apps.googleusercontent.com
VITE_APP_URL = https://snnap-frontend.onrender.com
VITE_APP_NAME = Snnap
VITE_APP_DESCRIPTION = Plataforma de criação de páginas com IA
VITE_REQUEST_TIMEOUT = 30000
VITE_MAX_RETRIES = 3
```

### 3. Salve e Aguarde
- Clique em **Save**
- O Render fará rebuild automático
- Aguarde 5-10 minutos

## 🎯 RESULTADO ESPERADO
- ✅ Frontend funcionando (200 OK)
- ✅ Importação de templates funcionando
- ✅ Verificação de créditos funcionando
- ✅ Admin/templates funcionando

## 📝 NOTA IMPORTANTE
O Vite precisa das variáveis de ambiente durante o **build time**, não no runtime. Por isso é essencial configurá-las no painel do Render.
