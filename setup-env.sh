#!/bin/bash

# Script para configurar variáveis de ambiente do frontend

echo "🔧 Configurando variáveis de ambiente do frontend..."

# Copiar arquivo de produção para .env
cp env.production .env

echo "✅ Arquivo .env criado com sucesso!"
echo ""
echo "📋 Variáveis configuradas:"
echo "- VITE_API_BASE_URL: https://snnap-backend.onrender.com/api"
echo "- VITE_LINK_AI_API_URL: https://snnap-link-ai.onrender.com/api"
echo "- VITE_PAYMENTS_API_URL: https://snnap-payments.onrender.com/api"
echo "- VITE_BIOLINK_API_URL: https://snnap.com/api"
echo "- VITE_GOOGLE_CLIENT_ID: 728951604455-kcdkj94g0vp1bmfqgeutf928aen0rd84.apps.googleusercontent.com"
echo "- VITE_APP_URL: https://snnap-frontend.vercel.app"
echo ""
echo "🚀 Agora você pode:"
echo "1. Testar localmente: npm run dev"
echo "2. Fazer build: npm run build"
echo "3. Configurar no Vercel Dashboard"













