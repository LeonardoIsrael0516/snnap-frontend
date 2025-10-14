// Debug version do SDK da Efí para identificar problemas

export interface CardData {
  brand: string;
  number: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  name: string;
  cpf: string;
}

// Função para testar carregamento do SDK
export async function testEfiSDKLoading(): Promise<any> {
  console.log('🧪 Testando carregamento do SDK Efí...');
  
  // Verificar se já está carregado
  if ((window as any).EfiPay) {
    console.log('✅ EfiPay já está carregado');
    return (window as any).EfiPay;
  }

  // Tentar carregar via CDN
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    
    // URL do SDK sandbox
    const sdkUrl = 'https://sandbox.gerencianet.com.br/v1/cdn/9892f8deff68bec71e66bd65c2661f5a';
    
    console.log('📡 Carregando SDK da URL:', sdkUrl);
    
    script.src = sdkUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('✅ Script carregado com sucesso');
      
      // Aguardar um pouco para o SDK inicializar
      setTimeout(() => {
        if ((window as any).EfiPay) {
          console.log('✅ EfiPay disponível após carregamento');
          console.log('🔍 Métodos disponíveis:', Object.keys((window as any).EfiPay));
          resolve((window as any).EfiPay);
        } else {
          console.error('❌ EfiPay não encontrado após carregamento');
          reject(new Error('EfiPay não encontrado'));
        }
      }, 2000);
    };
    
    script.onerror = (error) => {
      console.error('❌ Erro ao carregar script:', error);
      reject(new Error('Falha ao carregar SDK'));
    };
    
    document.head.appendChild(script);
  });
}

// Função para testar geração de token com debug
export async function testTokenGeneration(cardData: CardData): Promise<string> {
  try {
    console.log('🧪 Testando geração de token...');
    console.log('📝 Dados do cartão:', cardData);
    
    // Carregar SDK
    const EfiPay = await testEfiSDKLoading();
    
    if (!EfiPay) {
      throw new Error('SDK não disponível');
    }
    
    // Verificar métodos disponíveis
    console.log('🔍 EfiPay.CreditCard:', EfiPay.CreditCard);
    console.log('🔍 Métodos CreditCard:', EfiPay.CreditCard ? Object.keys(EfiPay.CreditCard) : 'N/A');
    
    // Testar diferentes códigos de conta
    const accountCodes = [
      '9892f8deff68bec71e66bd65c2661f5a', // Código atual
      'test_account_code', // Código de teste
      'sandbox_account' // Código sandbox genérico
    ];
    
    for (const accountCode of accountCodes) {
      try {
        console.log(`🧪 Testando com account code: ${accountCode}`);
        
        // Configurar conta
        EfiPay.CreditCard.setAccount(accountCode);
        EfiPay.CreditCard.setEnvironment('sandbox');
        
        // Tentar gerar token
        const response = await new Promise((resolve, reject) => {
          EfiPay.CreditCard.setCreditCardData({
            brand: cardData.brand,
            number: cardData.number,
            cvv: cardData.cvv,
            expirationMonth: cardData.expirationMonth,
            expirationYear: cardData.expirationYear,
            holderName: cardData.name,
            holderDocument: cardData.cpf,
            reuse: false
          }).getPaymentToken()
          .then(resolve)
          .catch(reject);
        });
        
        console.log('✅ Token gerado com sucesso:', response);
        return (response as any).payment_token;
        
      } catch (error: any) {
        console.log(`❌ Falhou com account code ${accountCode}:`, error.message);
        continue;
      }
    }
    
    throw new Error('Todos os códigos de conta falharam');
    
  } catch (error: any) {
    console.error('❌ Erro na geração de token:', error);
    throw error;
  }
}

// Função para verificar configuração
export function checkEfiConfig() {
  const config = {
    VITE_EFI_ACCOUNT_CODE: import.meta.env.VITE_EFI_ACCOUNT_CODE,
    VITE_EFI_SANDBOX: import.meta.env.VITE_EFI_SANDBOX,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  };
  
  console.log('🔧 Configuração Efí:', config);
  
  return config;
}

