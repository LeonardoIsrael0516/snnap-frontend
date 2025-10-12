// Script para debug do token do usuário
const jwt = require('jsonwebtoken');

// Simular o token que está sendo enviado pelo frontend
// Você pode pegar este token do localStorage do navegador
const userToken = localStorage.getItem('token'); // Este seria o token real

console.log('🔍 Debug do token do usuário:');
console.log('Token do localStorage:', userToken);

if (userToken) {
  try {
    // Decodificar o token (sem verificar a assinatura)
    const decoded = jwt.decode(userToken);
    console.log('Token decodificado:', decoded);
    
    if (decoded) {
      console.log('User ID:', decoded.userId || decoded.sub);
      console.log('Email:', decoded.email);
      console.log('Role:', decoded.role);
      console.log('Expira em:', new Date(decoded.exp * 1000));
      
      if (decoded.role !== 'ADMIN') {
        console.log('❌ Usuário não é admin! Role atual:', decoded.role);
        console.log('💡 Para acessar as APIs de planos, o usuário precisa ter role "ADMIN"');
      } else {
        console.log('✅ Usuário é admin!');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao decodificar token:', error);
  }
} else {
  console.log('❌ Nenhum token encontrado no localStorage');
  console.log('💡 Faça login primeiro para obter um token');
}

// Instruções para o usuário
console.log('\n📋 Instruções:');
console.log('1. Abra o navegador e vá para a aplicação');
console.log('2. Faça login como admin');
console.log('3. Abra o DevTools (F12)');
console.log('4. Vá para Console e execute: localStorage.getItem("token")');
console.log('5. Copie o token e substitua na variável userToken acima');
console.log('6. Execute este script novamente');




