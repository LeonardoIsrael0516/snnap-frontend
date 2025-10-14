#!/bin/bash

# Script para build local e upload manual para Vercel

echo "🔧 Fazendo build local do frontend..."

# Limpar build anterior
rm -rf dist

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Fazer build
echo "🏗️ Fazendo build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d "dist" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Diretório dist criado com $(du -sh dist | cut -f1) de arquivos"
    echo ""
    echo "🚀 Próximos passos:"
    echo "1. Acesse: https://vercel.com/dashboard"
    echo "2. Selecione: snnap-frontend"
    echo "3. Vá em: Deployments"
    echo "4. Clique em: 'Upload' ou 'Import'"
    echo "5. Faça upload da pasta 'dist'"
    echo ""
    echo "📋 Ou use o Vercel CLI:"
    echo "npx vercel --prod"
else
    echo "❌ Build falhou!"
    exit 1
fi






