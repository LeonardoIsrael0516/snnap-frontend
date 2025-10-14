// Integração com SDK JavaScript da Efí para tokenização de cartão
import { useState, useEffect } from 'react';

interface CardData {
  number: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  brand?: string;
  name?: string;
  cpf?: string;
}

interface EfiSDK {
  ready: (callback: () => void) => void;
  checkout: {
    getPaymentToken: (cardData: any, callback: (error: any, response: any) => void) => void;
  };
}

declare global {
  interface Window {
    $gn: any;
  }
}

// Carregar SDK de tokenização da Efí via CDN
export async function loadEfiTokenSDKFromCDN(): Promise<any> {
  if (typeof window === 'undefined') return null;
  
  // Verificar se já foi carregado
  if ((window as any).EfiPay) {
    return (window as any).EfiPay;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    
    // Testar diferentes URLs do SDK
    const sdkUrls = [
      'https://cdn.jsdelivr.net/gh/efipay/js-payment-token-efi/dist/payment-token-efi.min.js',
      'https://unpkg.com/payment-token-efi@latest/dist/payment-token-efi.min.js',
      'https://cdn.jsdelivr.net/npm/payment-token-efi@latest/dist/payment-token-efi.min.js'
    ];
    
    let currentUrlIndex = 0;
    
    const tryLoadSDK = () => {
      if (currentUrlIndex >= sdkUrls.length) {
        console.error('❌ Todas as URLs do SDK falharam');
        reject(new Error('Não foi possível carregar o SDK de tokenização Efí via CDN'));
        return;
      }
      
      const sdkUrl = sdkUrls[currentUrlIndex];
      
      script.src = sdkUrl;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Timeout para evitar espera infinita
      const timeout = setTimeout(() => {
        console.error(`❌ Timeout ao carregar SDK da URL ${currentUrlIndex + 1}`);
        currentUrlIndex++;
        tryLoadSDK();
      }, 8000);
      
      script.onload = () => {
        clearTimeout(timeout);
        
        // Aguardar um pouco para o SDK inicializar
        setTimeout(() => {
          if ((window as any).EfiPay) {
            
            // Configurar ambiente
            const sandbox = import.meta.env.VITE_EFI_SANDBOX === 'true';
            try {
              (window as any).EfiPay.CreditCard.setEnvironment(sandbox ? 'sandbox' : 'production');
            } catch (envError) {
              console.warn('⚠️ Erro ao configurar ambiente, continuando...', envError);
            }
            
            resolve((window as any).EfiPay);
          } else {
            console.error('❌ EfiPay não encontrado após carregar script');
            
            // Tentar próxima URL
            currentUrlIndex++;
            tryLoadSDK();
          }
        }, 2000);
      };
      
      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`❌ Erro ao carregar script SDK da URL ${currentUrlIndex + 1}:`, error);
        
        // Tentar próxima URL
        currentUrlIndex++;
        tryLoadSDK();
      };
      
      // Remover script anterior se existir
      const existingScript = document.querySelector('script[src*="payment-token-efi"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      document.head.appendChild(script);
    };
    
    tryLoadSDK();
  });
}

// Carregar SDK de tokenização da Efí via NPM
export async function loadEfiTokenSDKFromNPM(): Promise<any> {
  try {
    
    // Importar dinamicamente o pacote npm
    const EfiPay = await import('payment-token-efi');
    
    // Configurar ambiente
    const sandbox = import.meta.env.VITE_EFI_SANDBOX === 'true';
    try {
      EfiPay.default.CreditCard.setEnvironment(sandbox ? 'sandbox' : 'production');
    } catch (envError) {
      console.warn('⚠️ Erro ao configurar ambiente, continuando...', envError);
    }
    
    return EfiPay.default;
  } catch (error) {
    console.error('❌ Erro ao carregar SDK via NPM:', error);
    throw error;
  }
}

// Carregar SDK de tokenização da Efí (usa NPM diretamente)
export async function loadEfiTokenSDK(): Promise<any> {
  try {
    return await loadEfiTokenSDKFromNPM();
  } catch (npmError) {
    console.error('❌ Falha ao carregar via NPM:', npmError);
    throw new Error('Não foi possível carregar o SDK de tokenização Efí via NPM');
  }
}

// Detectar bandeira do cartão
export function detectCardBrand(cardNumber: string): string {
  const number = cardNumber.replace(/\D/g, '');
  
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  if (number.startsWith('6')) return 'discover';
  
  return 'visa'; // default
}

// Gerar payment token usando SDK oficial da Efí
export async function generatePaymentToken(cardData: CardData): Promise<string> {
  try {
    
    // Carregar SDK de tokenização
    const EfiPay = await loadEfiTokenSDK();
    
    if (!EfiPay) {
      throw new Error('SDK de tokenização Efí não disponível');
    }
    
    
    // Configurar payee_code (identificador da conta)
    const payeeCode = import.meta.env.VITE_EFI_ACCOUNT_CODE;
    const isSandbox = import.meta.env.VITE_EFI_SANDBOX === 'true';
    
    console.log('🔍 Configuração Efí SDK:', {
      hasPayeeCode: !!payeeCode,
      payeeCodeLength: payeeCode?.length,
      isSandbox,
      environment: isSandbox ? 'sandbox' : 'production'
    });
    
    if (!payeeCode) {
      throw new Error('VITE_EFI_ACCOUNT_CODE não configurado');
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Verificar se o método existe
        if (!EfiPay.CreditCard || typeof EfiPay.CreditCard.setCreditCardData !== 'function') {
          throw new Error('Métodos do SDK não disponíveis. Verifique se o SDK foi carregado corretamente.');
        }
        
        // Configurar timeout
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout ao gerar token de pagamento. Tente novamente.'));
        }, 30000); // 30 segundos
        
        // Usar setCreditCardData com objeto completo (método correto da Efí)
        EfiPay.CreditCard
          .setAccount(payeeCode)
          .setEnvironment(import.meta.env.VITE_EFI_SANDBOX === 'true' ? 'sandbox' : 'production')
          .setCreditCardData({
            brand: cardData.brand,
            number: cardData.number.replace(/\s/g, ''),
            cvv: cardData.cvv,
            expirationMonth: cardData.expirationMonth,
            expirationYear: cardData.expirationYear,
            holderName: cardData.name,
            holderDocument: cardData.cpf,
            reuse: false
          })
          .getPaymentToken()
          .then((response: any) => {
            clearTimeout(timeoutId);
            console.log('🔍 [FRONTEND] Token gerado:', response.payment_token);
            console.log('🔍 [FRONTEND] Tamanho do token:', response.payment_token?.length);
            console.log('🔍 [FRONTEND] Formato do token:', /^[a-f0-9]+$/i.test(response.payment_token) ? 'HEX' : 'OUTRO');
            resolve(response.payment_token);
          })
          .catch((error: any) => {
            clearTimeout(timeoutId);
            console.error('❌ Erro específico da Efí SDK:', error);
            reject(new Error(error.message || 'Erro ao gerar token de pagamento'));
          });
      } catch (error) {
        console.error('❌ Erro na configuração do SDK:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao carregar SDK de tokenização:', error);
    throw error;
  }
}

// Validar dados do cartão
export function validateCardData(cardData: CardData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar número do cartão
  const cardNumber = cardData.number.replace(/\D/g, '');
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    errors.push('Número do cartão inválido');
  }
  
  // Validar CVV
  if (cardData.cvv.length < 3 || cardData.cvv.length > 4) {
    errors.push('CVV inválido');
  }
  
  // Validar mês
  const month = parseInt(cardData.expirationMonth);
  if (month < 1 || month > 12) {
    errors.push('Mês de expiração inválido');
  }
  
  // Validar ano
  const year = parseInt(cardData.expirationYear);
  const currentYear = new Date().getFullYear();
  if (year < currentYear || year > currentYear + 20) {
    errors.push('Ano de expiração inválido');
  }
  
  // Validar se não está expirado
  if (year === currentYear && month < new Date().getMonth() + 1) {
    errors.push('Cartão expirado');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Formatar número do cartão
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
}

// Formatar CVV
export function formatCVV(value: string): string {
  return value.replace(/\D/g, '').substring(0, 4);
}

// Formatar CPF
export function formatCPF(value: string): string {
  const v = value.replace(/\D/g, '');
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar data de expiração
export function formatExpiryDate(value: string): string {
  const v = value.replace(/\D/g, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
}

// Verificar se o SDK está disponível
export async function isEfiSDKAvailable(): Promise<boolean> {
  try {
    await loadEfiTokenSDK();
    return true;
  } catch {
    return false;
  }
}

// Hook para usar o SDK Efí
export function useEfiSDK() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSDK = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadEfiTokenSDK();
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar SDK');
        setIsLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSDK();
  }, []);
  
  return {
    isLoaded,
    isLoading,
    error,
    generateToken: generatePaymentToken,
    validateCard: validateCardData
  };
}

